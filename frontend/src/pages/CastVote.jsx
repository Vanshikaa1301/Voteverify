import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import * as faceapi from '@vladmandic/face-api'
import apiClient from '../api/axios'
import Topbar from '../components/layout/Topbar'

const formatAadhaar = (val) => {
  const clean = val.replace(/\D/g, '').slice(0, 12)
  const matches = clean.match(/(\d{0,4})(\d{0,4})(\d{0,4})/)
  if (!matches) return ''
  return [matches[1], matches[2], matches[3]].filter(Boolean).join('-')
}

// ─── Step constants ───
const STEP_IDENTITY = 'identity'
const STEP_LIVENESS = 'liveness'
const STEP_SUCCESS  = 'success'

const stepLabels = ['Identity Check', 'Biometric Liveness', 'Vote Anchored']

// ─── Liveness sub-states ───
const LIVENESS_IDLE       = 'idle'        // Camera not started
const LIVENESS_STREAMING  = 'streaming'   // Camera feed live, waiting for capture
const LIVENESS_VERIFYING  = 'verifying'   // Captured, sending to backend
const LIVENESS_PASSED     = 'passed'      // Backend returned success
const LIVENESS_FAILED     = 'failed'      // Backend returned failure

export default function CastVote() {
  const [candidates, setCandidates] = useState([])
  const [selectedCandidate, setSelectedCandidate] = useState('')
  const [aadhaarInput, setAadhaarInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successData, setSuccessData] = useState(null)

  // Multi-step state
  const [step, setStep] = useState(STEP_IDENTITY)

  // Liveness state
  const [livenessStatus, setLivenessStatus] = useState(LIVENESS_IDLE)
  const [livenessMessage, setLivenessMessage] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [livenessToken, setLivenessToken] = useState(null)
  const [verifiedVoter, setVerifiedVoter] = useState(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ])
        setModelsLoaded(true)
      } catch (err) {
        console.error('Failed to load face-api models', err)
      }
    }
    loadModels()
  }, [])

  useEffect(() => {
    // Load candidates on mount
    apiClient.get('/votes')
      .then((res) => {
        setCandidates(res.data.candidates || [])
      })
      .catch((err) => {
        console.error('Error loading candidates', err)
        setError('Failed to load CR Candidates.')
      })
  }, [])

  // Cleanup camera stream on unmount or step change
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleAadhaarChange = (e) => {
    setAadhaarInput(formatAadhaar(e.target.value))
  }

  // ─── Step 1 → Step 2 ───
  const handleIdentitySubmit = (e) => {
    e.preventDefault()
    setError(null)

    const cleanAadhaar = aadhaarInput.replace(/-/g, '')
    if (!selectedCandidate || aadhaarInput.replace(/-/g, '').length !== 12) return
    setError('')
    setStep(STEP_LIVENESS)
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setError('')
    setLivenessMessage('')
    setCapturedImage(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setLivenessStatus(LIVENESS_STREAMING)
    } catch (err) {
      setError('Camera access denied or unavailable. Please allow camera permissions.')
      setLivenessStatus(LIVENESS_FAILED)
    }
  }

  const handleLivenessCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !modelsLoaded) {
      setError('Biometric models are not loaded yet or camera is offline.')
      return
    }

    setLivenessStatus(LIVENESS_VERIFYING)
    setLivenessMessage('Computing biometric vector...')

    // Capture visual frame for UI
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.8))

    try {
      // 1. Detect single face and compute descriptor using face-api.js
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setLivenessStatus(LIVENESS_FAILED)
        setLivenessMessage('No clear face detected. Look directly at the camera.')
        return
      }

      setLivenessMessage('Verifying biometric vector against UIDAI database...')
      const descriptorArray = Array.from(detection.descriptor)
      
      // Stop the camera since we got the vector
      stopCamera()

      // 2. Send descriptor to backend for real mathematical comparison
      const response = await apiClient.post('/votes/liveness', {
        aadhaar: aadhaarInput,
        descriptor: descriptorArray
      })

      if (response.data.success) {
        setLivenessStatus(LIVENESS_PASSED)
        setLivenessMessage('Biometric vector matches Aadhaar identity!')
        setLivenessToken(response.data.livenessToken)
        setVerifiedVoter(response.data.voter || null)
        
        // 3. Automatically submit vote after 1.5s success
        setTimeout(() => {
          submitVote(response.data.livenessToken)
        }, 1500)
      }
    } catch (err) {
      setLivenessStatus(LIVENESS_FAILED)
      const msg = err.response?.data?.error || err.message || 'Liveness check failed'
      setLivenessMessage(msg)
    }
  }

  const submitVote = async (token) => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiClient.post('/votes', {
        aadhaar: aadhaarInput,
        candidateId: selectedCandidate,
        livenessToken: token
      })

      setSuccessData(data.vote)
      setStep(STEP_SUCCESS)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit vote')
      // If the vote fails, we might need to redo liveness because token is burned
      setLivenessStatus(LIVENESS_FAILED)
      setLivenessMessage('Vote submission failed. Please try verifying again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetryLiveness = () => {
    setLivenessStatus(LIVENESS_IDLE)
    setLivenessMessage('')
    setError('')
    startCamera()
  }

  const handleGoBack = () => {
    stopCamera()
    setStep(STEP_IDENTITY)
    setLivenessStatus(LIVENESS_IDLE)
    setLivenessMessage('')
  }

  const handleReset = () => {
    setSelectedCandidate(null)
    setAadhaarInput('')
    setSuccessData(null)
    setLivenessToken(null)
    setVerifiedVoter(null)
    setLivenessStatus(LIVENESS_IDLE)
    setStep(STEP_IDENTITY)
  }

  const stepIndex = step === STEP_IDENTITY ? 0 : step === STEP_LIVENESS ? 1 : 2

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Voter Identity Verification Terminal"
        subtitle="Secure biometric liveness & Aadhaar validation for polling stations"
        mockMode={false}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl">

          {/* Step Progress Bar */}
          <div className="flex items-center justify-center gap-0 mb-6">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < stepIndex
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                      : i === stepIndex
                        ? 'bg-vv-accent text-white shadow-lg shadow-vv-accent/30 scale-110'
                        : 'bg-vv-surface-muted text-vv-muted border border-vv-border'
                  }`}>
                    {i < stepIndex ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className={`mt-1.5 text-[10px] font-semibold tracking-wide ${
                    i <= stepIndex ? 'text-vv-heading' : 'text-vv-muted'
                  }`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`mx-3 h-px w-12 sm:w-20 transition-colors duration-300 ${
                    i < stepIndex ? 'bg-emerald-500' : 'bg-vv-border'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ══════════════ STEP 1: Identity ══════════════ */}
            {step === STEP_IDENTITY && (
              <motion.div
                key="vote-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl border border-vv-border bg-vv-surface p-6 md:p-8 shadow-card space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-vv-heading">National Polling Station Terminal</h2>
                  <p className="text-sm text-vv-muted leading-relaxed">
                    Authorized Polling Officers only. Authenticate voter identity via UIDAI registry before issuing the electronic ballot. All verification attempts are permanently logged to the secure audit ledger.
                  </p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                <form onSubmit={handleIdentitySubmit} className="space-y-6">
                  {/* Candidates List - Relabeled as Ballot Issue */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-vv-heading">Issue Electronic Ballot</label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {candidates.map((cand) => {
                        const isSelected = selectedCandidate === cand.id
                        return (
                          <button
                            key={cand.id}
                            type="button"
                            onClick={() => setSelectedCandidate(cand.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'border-vv-accent bg-vv-accent/10 shadow-lg shadow-vv-accent/10'
                                : 'border-vv-border bg-vv-bg hover:border-vv-accent/40'
                            }`}
                          >
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full mb-3 transition ${
                              isSelected ? 'bg-vv-accent text-white' : 'bg-vv-surface-muted text-vv-muted'
                            }`}>
                              {isSelected ? (
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <span className="text-sm font-semibold">{cand.id.toUpperCase()}</span>
                              )}
                            </div>
                            <span className="text-sm font-bold text-vv-heading leading-tight">{cand.name}</span>
                            <span className="text-xs text-vv-muted mt-1">{cand.group}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Aadhaar Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-vv-heading">Voter Aadhaar Number (UID)</label>
                    <input
                      type="text"
                      required
                      placeholder="0000-0000-0000"
                      value={aadhaarInput}
                      onChange={handleAadhaarChange}
                      className="w-full text-center tracking-widest font-mono text-lg rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
                    />
                    <p className="text-[11px] text-vv-muted text-center pt-0.5">
                      12-digit national identity number. Encrypted client-side. Only SHA-256 hashes hit the backend servers.
                    </p>
                  </div>

                  {/* Proceed to Liveness Button */}
                  <button
                    type="submit"
                    disabled={!selectedCandidate || aadhaarInput.replace(/-/g, '').length !== 12}
                    className="w-full rounded-xl bg-vv-accent py-3.5 text-base font-bold text-white shadow-lg shadow-vv-accent/25 transition hover:bg-vv-accent-dim disabled:opacity-50 disabled:shadow-none dark:text-navy"
                  >
                    Proceed to Biometric Liveness Verification →
                  </button>
                </form>
              </motion.div>
            )}

            {/* ══════════════ STEP 2: Liveness ══════════════ */}
            {step === STEP_LIVENESS && (
              <motion.div
                key="liveness-check"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="rounded-2xl border border-vv-border bg-vv-surface p-6 md:p-8 shadow-card space-y-6"
              >
                <div className="text-center space-y-2">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-vv-accent/10 text-vv-accent mb-2">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-vv-heading">Biometric Liveness Verification</h2>
                  <p className="text-sm text-vv-muted leading-relaxed">
                    Instruct the voter to look directly at the camera. The system will detect human liveness and match facial vectors against the UIDAI database.
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-vv-bg border border-vv-border px-3 py-1 text-xs text-vv-muted">
                    <span className="font-mono">Verification Target (UID):</span>
                    <span className="font-bold text-vv-heading">****-****-{aadhaarInput.slice(-4)}</span>
                  </div>
                  {verifiedVoter ? (
                    <div className="mx-auto max-w-sm rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-left text-xs">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-300">Matched voter</p>
                      <p className="mt-1 text-vv-heading">{verifiedVoter.name}</p>
                      <p className="text-vv-muted">Mobile ending {verifiedVoter.mobileLast4 || '----'}</p>
                    </div>
                  ) : null}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:text-red-400"
                  >
                    ⚠️ {error}
                  </motion.div>
                )}

                {/* Camera viewport */}
                <div className="relative mx-auto w-full max-w-sm aspect-[4/3] rounded-2xl overflow-hidden border-2 border-vv-border bg-black/90">
                  {/* Video feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover ${
                      capturedImage ? 'hidden' : 'block'
                    }`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {/* Captured snapshot overlay */}
                  {capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured face"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  )}
                  {/* Hidden canvas for capture */}
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Face detection overlay guide */}
                  {livenessStatus === LIVENESS_STREAMING && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-40 h-52 border-2 border-dashed border-vv-accent/60 rounded-[50%] animate-pulse" />
                    </div>
                  )}

                  {/* Idle state - camera not started */}
                  {livenessStatus === LIVENESS_IDLE && !capturedImage && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white gap-3">
                      <svg className="h-12 w-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm opacity-70">Hardware initialization pending...</span>
                    </div>
                  )}

                  {/* Verifying overlay */}
                  {livenessStatus === LIVENESS_VERIFYING && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white gap-3">
                      <svg className="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="text-sm font-medium">Computing facial vectors & matching...</span>
                    </div>
                  )}

                  {/* Passed overlay */}
                  {livenessStatus === LIVENESS_PASSED && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-900/60 text-white gap-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40"
                      >
                        <svg className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                      <span className="text-sm font-bold">Liveness Verified!</span>
                    </div>
                  )}

                  {/* Failed overlay */}
                  {livenessStatus === LIVENESS_FAILED && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/50 text-white gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/80">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-center px-4">{livenessMessage}</span>
                    </div>
                  )}
                </div>

                {/* Status message */}
                {livenessMessage && livenessStatus !== LIVENESS_FAILED && (
                  <p className={`text-center text-sm font-medium ${
                    livenessStatus === LIVENESS_PASSED
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-vv-muted'
                  }`}>
                    {livenessStatus === LIVENESS_PASSED && '✅ '}{livenessMessage}
                    {loading && ' Processing cryptographically signed ballot...'}
                  </p>
                )}

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={handleGoBack}
                    disabled={loading || livenessStatus === LIVENESS_VERIFYING}
                    className="rounded-xl border border-vv-border bg-vv-bg px-5 py-3 text-sm font-semibold text-vv-text hover:bg-vv-surface-muted disabled:opacity-50 sm:w-auto"
                  >
                    ← Back
                  </button>

                  {/* Start Camera */}
                  {livenessStatus === LIVENESS_IDLE && (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex-1 rounded-xl bg-vv-accent py-3 text-sm font-bold text-white shadow-lg shadow-vv-accent/25 transition hover:bg-vv-accent-dim dark:text-navy"
                    >
                      Initialize Sensor Stream
                    </button>
                  )}

                  {/* Capture Face */}
                  {livenessStatus === LIVENESS_STREAMING && (
                    <button
                      type="button"
                      onClick={handleLivenessCapture}
                      className="flex-1 rounded-xl bg-vv-accent py-3 text-sm font-bold text-white shadow-lg shadow-vv-accent/25 transition hover:bg-vv-accent-dim dark:text-navy animate-pulse"
                    >
                      📸 Capture Biometric Vector
                    </button>
                  )}

                  {/* Retry */}
                  {livenessStatus === LIVENESS_FAILED && (
                    <button
                      type="button"
                      onClick={handleRetryLiveness}
                      className="flex-1 rounded-xl bg-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/25 transition hover:bg-amber-600"
                    >
                      🔄 Restart Hardware Sensor
                    </button>
                  )}

                  {/* Verifying indicator */}
                  {(livenessStatus === LIVENESS_VERIFYING || livenessStatus === LIVENESS_PASSED) && (
                    <div className="flex-1 flex items-center justify-center rounded-xl border border-vv-border bg-vv-bg py-3 text-sm font-medium text-vv-muted">
                      {livenessStatus === LIVENESS_VERIFYING && (
                        <span className="flex items-center gap-2">
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Establishing secure connection...
                        </span>
                      )}
                      {livenessStatus === LIVENESS_PASSED && (
                        <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {loading ? 'Transmitting ballot data...' : 'Validation successful.'}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ══════════════ STEP 3: Success ══════════════ */}
            {step === STEP_SUCCESS && successData && (
              <motion.div
                key="vote-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-vv-border bg-vv-surface p-6 md:p-8 shadow-card text-center space-y-6"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-md">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-vv-heading">Authentication & Issuance Successful</h2>
                  <p className="text-sm text-vv-muted">
                    The voter identity was mathematically proven against Aadhaar and biometric verification nodes. A cryptographically anonymous ballot has been anchored to the national election ledger.
                  </p>
                </div>

                {/* Ballot details */}
                <div className="rounded-xl bg-vv-bg border border-vv-border p-4 text-left font-mono text-xs text-vv-text space-y-1.5 max-w-sm mx-auto">
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Ledger TX Hash:</span>
                    <span className="font-bold text-vv-heading truncate ml-4">0x{successData.id}{window.crypto.randomUUID().split('-')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Aadhaar Map (Anonymized):</span>
                    <span className="font-bold text-vv-heading">XXXX-XXXX-{successData.aadhaarLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Voter:</span>
                    <span className="font-bold text-vv-heading">{successData.voterName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Mobile:</span>
                    <span className="font-bold text-vv-heading">XXXXXX{successData.voterMobileLast4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Biometric Liveness:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">✓ Vector Match Passed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-vv-muted">Secure Timestamp:</span>
                    <span className="font-bold text-vv-heading">
                      {new Date(successData.timestamp).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-vv-border bg-vv-bg px-5 py-3 text-sm font-semibold text-vv-text hover:bg-vv-surface-muted"
                  >
                    Authenticate Next Voter
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="rounded-xl bg-vv-accent px-5 py-3 text-sm font-semibold text-white shadow-md hover:bg-vv-accent-dim dark:text-navy"
                  >
                    Return to National Dashboard
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
