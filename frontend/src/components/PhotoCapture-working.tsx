import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Button } from 'primereact/button'
import { Toast } from 'primereact/toast'

interface PhotoCaptureProps {
  onPhotoCapture: (photoData: string) => void
  onPhotoUpload: (file: File, customName?: string) => Promise<void>
  currentPhoto?: string
  disabled?: boolean
  cedula?: string
}

export interface PhotoCaptureRef {
  stopCamera: () => void
}

const PhotoCapture = forwardRef<PhotoCaptureRef, PhotoCaptureProps>(({
  onPhotoCapture,
  onPhotoUpload,
  currentPhoto,
  disabled = false,
  cedula = ''
}, ref) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [capturedImage, setCapturedImage] = useState<string>(currentPhoto || '')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const toast = useRef<Toast>(null)

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    stopCamera
  }))

  // Detener cámara automáticamente cuando se deshabilita el componente
  useEffect(() => {
    if (disabled && isStreaming) {
      stopCamera()
    }
  }, [disabled, isStreaming])

  // Actualizar imagen capturada cuando cambia currentPhoto
  useEffect(() => {
    setCapturedImage(currentPhoto || '')
  }, [currentPhoto])

  const startCamera = useCallback(async () => {
    try {
      console.log('🔍 Iniciando cámara...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      })
      
      console.log('✅ Stream obtenido:', stream)
      
      if (videoRef.current) {
        console.log('📹 Configurando video element...')
        videoRef.current.srcObject = stream
        streamRef.current = stream
        
        // Agregar eventos de debug
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata cargado:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
        }
        
        videoRef.current.oncanplay = () => {
          console.log('📹 Video puede reproducirse')
        }
        
        videoRef.current.onplaying = () => {
          console.log('📹 Video reproduciéndose')
        }
        
        videoRef.current.onerror = (e) => {
          console.error('📹 Error en video:', e)
        }
        
        // Configurar eventos y iniciar reproducción
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video metadata cargado, iniciando reproducción...')
          videoRef.current!.play().then(() => {
            console.log('✅ Video iniciado y reproduciéndose')
            setIsStreaming(true)
          }).catch((playError) => {
            console.error('❌ Error al reproducir video:', playError)
          })
        }
        
        // Forzar carga de metadata si ya está disponible
        if (videoRef.current.readyState >= 1) {
          console.log('📹 Video ya tiene metadata, iniciando reproducción inmediatamente...')
          videoRef.current.play().then(() => {
            console.log('✅ Video iniciado inmediatamente')
            setIsStreaming(true)
          }).catch((playError) => {
            console.error('❌ Error al reproducir video:', playError)
          })
        }
      } else {
        console.error('❌ videoRef.current es null')
      }
    } catch (error: any) {
      console.error('❌ Error:', error)
      
      let errorMessage = 'No se pudo acceder a la cámara. Verifique los permisos.'
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Permisos de cámara denegados. Permite el acceso en la configuración del navegador.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No se encontró ninguna cámara. Verifica que tengas una cámara conectada.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'La cámara está siendo usada por otra aplicación.'
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Tu navegador no soporta acceso a la cámara.'
      }
      
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: errorMessage,
        life: 5000
      })
    }
  }, [])

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement> | { target: { files: File[] } }) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor seleccione un archivo de imagen válido',
        life: 5000
      })
      return
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'El archivo es demasiado grande. Máximo 5MB',
        life: 5000
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      // Subir archivo usando el servicio de API
      await onPhotoUpload(file, cedula) // Pasar la cédula como nombre personalizado
      
      // Convertir a base64 para mostrar en la vista previa
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCapturedImage(result)
        
        clearInterval(progressInterval)
        setUploadProgress(100)
        
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
          toast.current?.show({
            severity: 'success',
            summary: 'Archivo Subido',
            detail: 'La imagen se ha subido exitosamente',
            life: 3000
          })
        }, 500)
      }
      
      reader.readAsDataURL(file)

    } catch (error) {
      setIsUploading(false)
      setUploadProgress(0)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al subir la imagen',
        life: 5000
      })
    }
  }, [onPhotoCapture, onPhotoUpload])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('❌ Video o canvas no disponible')
      return
    }

    if (!cedula) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Por favor ingrese la cédula antes de capturar la foto',
        life: 5000
      })
      return
    }

    console.log('📸 Capturando foto...')
    setIsCapturing(true)
    
    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')
      
      if (!context) {
        throw new Error('No se pudo obtener contexto del canvas')
      }

      // Configurar canvas
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      
      console.log(`📐 Canvas: ${canvas.width}x${canvas.height}`)
      
      // Dibujar video en canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convertir a blob para subir como archivo
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
        }, 'image/jpeg', 0.8)
      })
      
      // Crear archivo desde blob
      const fileName = cedula ? `${cedula}.jpg` : `visitante_${Date.now()}.jpg`
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      
      console.log(`✅ Archivo creado: ${file.name}, ${file.size} bytes`)
      
      // Subir archivo usando el sistema existente
      await handleFileUpload({ target: { files: [file] } } as any)
      
      setIsCapturing(false)
      
      toast.current?.show({
        severity: 'success',
        summary: 'Foto Capturada',
        detail: 'La foto se ha capturado y subido exitosamente',
        life: 3000
      })
      
    } catch (error: any) {
      console.error('❌ Error al capturar foto:', error)
      setIsCapturing(false)
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Error al capturar la foto',
        life: 5000
      })
    }
  }, [handleFileUpload, cedula])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setIsStreaming(false)
    console.log('🛑 Cámara detenida')
  }, [])

  const removePhoto = () => {
    setCapturedImage('')
    onPhotoCapture('')
    stopCamera()
    toast.current?.show({
      severity: 'info',
      summary: 'Foto Eliminada',
      detail: 'La foto ha sido eliminada',
      life: 3000
    })
  }

  return (
    <div className="photo-capture-container">
      <Toast ref={toast} />
      
      {/* Controles de cámara */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        <Button
          label="Iniciar Cámara"
          icon="pi pi-camera"
          onClick={startCamera}
          disabled={disabled || isStreaming || isUploading}
          className="p-button-outlined p-button-primary"
          style={{ flex: '1', minWidth: '150px' }}
        />
        
        <Button
          label="Tomar Foto"
          icon="pi pi-camera"
          onClick={capturePhoto}
          disabled={disabled || !isStreaming || isCapturing || isUploading || !cedula}
          className="p-button"
          style={{ flex: '1', minWidth: '150px' }}
          tooltip={!cedula ? 'Ingrese la cédula primero' : 'Capturar foto'}
        />
        
        <Button
          label="Detener Cámara"
          icon="pi pi-stop"
          onClick={stopCamera}
          disabled={disabled || !isStreaming || isUploading}
          className="p-button-outlined p-button-danger"
          style={{ flex: '1', minWidth: '150px' }}
        />
      </div>

      {/* Barra de progreso para upload */}
      {isUploading && (
        <div className="mb-3">
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${uploadProgress}%` }}
              aria-valuenow={uploadProgress} 
              aria-valuemin={0} 
              aria-valuemax={100}
            >
              {uploadProgress}%
            </div>
          </div>
        </div>
      )}

      {/* Vista de cámara e imagen capturada */}
      <div className="row">
        {/* Video de la cámara */}
        <div className="col-md-6">
          <div className="camera-preview">
            <h6 className="mb-2">
              <i className="pi pi-video me-1"></i>
              Vista de la Cámara
            </h6>
            <div 
              className="border rounded d-flex align-items-center justify-content-center position-relative"
              style={{ 
                height: '300px', 
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6'
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-100 h-100"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '4px',
                  display: isStreaming ? 'block' : 'none'
                }}
              />
              {!isStreaming && (
                <div className="text-center text-muted position-absolute">
                  <i className="pi pi-camera" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                  <p className="mb-0">Cámara no iniciada</p>
                  <small>Haz clic en "Iniciar Cámara"</small>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Imagen capturada */}
        <div className="col-md-6">
          <div className="captured-preview">
            <h6 className="mb-2">
              <i className="pi pi-image me-1"></i>
              Foto Capturada
            </h6>
            <div 
              className="border rounded d-flex align-items-center justify-content-center position-relative"
              style={{ 
                height: '300px', 
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6'
              }}
            >
              {capturedImage ? (
                <>
                  <img
                    src={capturedImage}
                    alt="Foto capturada"
                    className="w-100 h-100"
                    style={{ 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-sm"
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      width: '32px',
                      height: '32px'
                    }}
                    onClick={removePhoto}
                    disabled={disabled}
                    tooltip="Eliminar foto"
                  />
                </>
              ) : (
                <div className="text-center text-muted">
                  <i className="pi pi-image" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                  <p className="mb-0">No hay foto</p>
                  <small>Captura una foto o sube un archivo</small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas oculto para captura */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
})

PhotoCapture.displayName = 'PhotoCapture'

export default PhotoCapture
