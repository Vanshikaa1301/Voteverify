import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import * as faceapi from '@vladmandic/face-api'
import apiClient from '../api/axios'
import Topbar from '../components/layout/Topbar'

const STEP_DETAILS = 'DETAILS'
const STEP_CAPTURE = 'CAPTURE'
const STEP_SUCCESS = 'SUCCESS'

const formatAadhaar = (value) => {
  const clean = value.replace(/\D/g, '').slice(0, 12)
  return clean.replace(/(\d{4})(?=\d)/g, '$1-')
}

export default function RegisterVoter() {
  const [step, setStep] = useState(STEP_DETAILS)
  const [nameInput, setNameInput] = useState('')
  const [mobileInput, setMobileInput] = useState('')
  const [aadhaarInput, setAadhaarInput] = useState('')
  const [error, setError] = useState('')
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [captureStatus, setCaptureStatus] = useState('IDLE')
  const [statusMessage, setStatusMessage] = useState('')

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ])
        setModelsLoaded(true)
      } catch (err) {
        console.error('Error loading face-api models:', err)
        setError('Failed to load biometric models.')
      }
    }
    loadModels()
    return () => stopCamera()
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }

  const startCamera = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      setError('Camera access denied. Please allow camera permissions.')
    }
  }

  const handleDetailsSubmit = (e) => {
    e.preventDefault()
    if (!nameInput.trim()) return setError('Please enter voter name.')
    if (mobileInput.length !== 10) return setError('Please enter a valid 10-digit mobile number.')
    if (aadhaarInput.replace(/\D/g, '').length !== 12) return setError('Please enter a valid 12-digit Aadhaar number.')
    if (!modelsLoaded) return setError('Biometric models are still loading, please wait.')
    setStep(STEP_CAPTURE)
    startCamera()
  }

  const captureAndRegister = async () => {
    if (!videoRef.current) return

    setCaptureStatus('DETECTING')
    setStatusMessage('Scanning face and creating biometric vector...')

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setCaptureStatus('FAILED')
        setStatusMessage('No clear face detected. Please face the camera directly.')
        return
      }

      setStatusMessage('Saving Aadhaar, mobile and face verification...')
      await apiClient.post('/votes/register-face', {
        name: nameInput.trim(),
        mobile: mobileInput,
        aadhaar: aadhaarInput.replace(/\D/g, ''),
        descriptor: Array.from(detection.descriptor),
      })

      stopCamera()
      setCaptureStatus('SUCCESS')
      setStep(STEP_SUCCESS)
    } catch (err) {
      console.error(err)
      setCaptureStatus('FAILED')
      setStatusMessage(err.response?.data?.error || 'Failed to register voter.')
    }
  }

  const handleReset = () => {
    setNameInput('')
    setMobileInput('')
    setAadhaarInput('')
    setStep(STEP_DETAILS)
    setCaptureStatus('IDLE')
    setStatusMessage('')
    setError('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Topbar
        title="Self Voter Registration"
        subtitle="Name, mobile, Aadhaar upload and AI face verification"
        mockMode={false}
      />

      <main className="flex flex-1 items-center justify-center overflow-y-auto p-4 md:p-6">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {step === STEP_DETAILS && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 rounded-xl border border-vv-border bg-vv-surface p-6 shadow-card md:p-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-vv-heading">Register New Voter</h2>
                  <p className="text-sm text-vv-muted">
                    The voter enters their own name, mobile number and Aadhaar before face verification.
                  </p>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-600">
                    {error}
                  </div>
                ) : null}

                <form onSubmit={handleDetailsSubmit} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-vv-heading">Voter Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter full name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-vv-heading focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-vv-heading">Mobile Number</label>
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile"
                        value={mobileInput}
                        onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 font-mono text-vv-heading focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-vv-heading">Aadhaar Number</label>
                    <input
                      type="text"
                      required
                      placeholder="0000-0000-0000"
                      value={aadhaarInput}
                      onChange={(e) => setAadhaarInput(formatAadhaar(e.target.value))}
                      className="w-full rounded-xl border border-vv-border bg-vv-bg px-4 py-3 text-center font-mono text-lg tracking-widest text-vv-heading focus:border-vv-accent focus:outline-none focus:ring-1 focus:ring-vv-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!nameInput.trim() || mobileInput.length !== 10 || aadhaarInput.replace(/\D/g, '').length !== 12 || !modelsLoaded}
                    className="w-full rounded-xl bg-vv-accent py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-vv-accent-dim disabled:opacity-50"
                  >
                    {modelsLoaded ? 'Proceed to Face Verification' : 'Loading AI Models...'}
                  </button>
                </form>
              </motion.div>
            )}

            {step === STEP_CAPTURE && (
              <motion.div
                key="step-capture"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 rounded-xl border border-vv-border bg-vv-surface p-6 shadow-card md:p-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold text-vv-heading">AI Face Verification</h2>
                  <p className="text-sm text-vv-muted">
                    Capture a clear live face image for {nameInput}. This biometric vector will be used before voting.
                  </p>
                </div>

                <div className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-xl border-2 border-vv-border bg-black/90">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  {captureStatus === 'DETECTING' ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                      <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      <span className="px-4 text-center text-sm font-medium">{statusMessage}</span>
                    </div>
                  ) : null}
                  {captureStatus === 'FAILED' ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/60 p-4 text-center text-sm font-bold text-white">
                      {statusMessage}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera()
                      setStep(STEP_DETAILS)
                      setCaptureStatus('IDLE')
                    }}
                    disabled={captureStatus === 'DETECTING'}
                    className="rounded-xl border border-vv-border bg-vv-bg px-5 py-3 text-sm font-semibold text-vv-text hover:bg-vv-surface-muted"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={captureAndRegister}
                    disabled={captureStatus === 'DETECTING'}
                    className="flex-1 rounded-xl bg-vv-accent py-3 text-sm font-bold text-white shadow-lg transition hover:bg-vv-accent-dim"
                  >
                    {captureStatus === 'FAILED' ? 'Retry Face Capture' : 'Register Voter'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === STEP_SUCCESS && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 rounded-xl border border-vv-border bg-vv-surface p-6 text-center shadow-card md:p-8"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-md">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-vv-heading">Registration Complete</h2>
                  <p className="text-sm text-vv-muted">
                    {nameInput} can now verify Aadhaar, pass face liveness and cast a vote.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full rounded-xl bg-vv-accent py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-vv-accent-dim"
                >
                  Register Another Voter
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
