import React from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../hooks/useAuth'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CContainer,
  CRow,
  CCol,
  CForm,
  CFormLabel,
  CAlert,
} from '@coreui/react'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
// removed unused Toast import
import { Divider } from 'primereact/divider'
import bannerSiconvis from '../../images/bannerSiconvis.jpg'
import CIcon from '@coreui/icons-react'
// using static path from publicDir

const schema = yup.object({
  login: yup
    .string()
    .required('El usuario es requerido')
    .min(3, 'El usuario debe tener al menos 3 caracteres'),
  password: yup
    .string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

interface LoginForm {
  login: string
  password: string
}

const Login: React.FC = () => {
  const { login, loading } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<LoginForm>({
    resolver: yupResolver(schema),
  })

  const onSubmit = async (data: LoginForm) => {
    await login(data.login, data.password)
  }

  // removed unused toggle visibility handler

  return (
    <div
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: '#f5f7fb',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fondo limpio sin patrón */}

      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6} lg={5} xl={4}>
            <CCard className="shadow border-0" style={{ borderRadius: '14px' }}>
              <CCardHeader
                className="text-center py-5"
                style={{
                  background: '#001a79',
                  color: 'white',
                  borderRadius: '14px 14px 0 0',
                }}
              >
                <div className="mb-4">
                  <CIcon
                    icon="cil-user"
                    size="3xl"
                    style={{ fontSize: '4rem' }}
                  />
                </div>
                <CCardTitle className="h4 mb-3" style={{ lineHeight: '1.2', letterSpacing: '0.5px' }}>
                  SICONVIS
                </CCardTitle>
				
				<div className="mb-3"> 
					<img
						src={bannerSiconvis}
						alt="SICONVIS"
						className="img-fluid d-block mx-auto"
						style={{ 
							maxWidth: '260px',
							height: 'auto',
							borderRadius: '8px',
							border: '1px solid rgba(255,255,255,0.4)',
							marginBottom: '1rem'
						}}
					/>
				</div>
				
                <p className="mb-0 opacity-75" style={{ 
                  fontSize: '0.95rem', 
                  lineHeight: '1.4',
                  marginBottom: '0.5rem'
                }}>
						
				
                  Sistema de Control de Visitantes
                </p>
              </CCardHeader>

              <CCardBody className="px-4 py-4">
                <div className="text-center mb-4">
                  <h5 className="mb-2" style={{ lineHeight: '1.3', color: '#001a79' }}>Iniciar Sesión</h5>
                  <p className="text-muted" style={{ 
                    fontSize: '0.95rem', 
                    lineHeight: '1.4',
                    marginBottom: '0'
                  }}>
                    Ingrese sus credenciales para acceder al sistema
                  </p>
                </div>

                <CForm onSubmit={handleSubmit(onSubmit)}>
                  <div className="mb-3">
                    <CFormLabel htmlFor="login" className="fw-semibold mb-2 d-block">
                      Usuario
                    </CFormLabel>
                    <div className="p-input-icon-left" style={{ maxWidth: '100%', position: 'relative' }}>
                      <i 
                        className="pi pi-user" 
                        style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6c757d'
                        }}
                      />
                      <InputText
                        id="login"
                        {...register('login')}
                        className={`form-control ${errors.login ? 'p-invalid' : ''}`}
                        placeholder="Ingrese su usuario"
                        disabled={loading}
                        style={{ 
                          paddingLeft: '2.5rem',
                          paddingTop: '0.65rem',
                          paddingBottom: '0.65rem',
                          fontSize: '0.95rem'
                        }}
                      />
                    </div>
                    {errors.login && (
                      <small className="text-danger d-block mt-2">
                        {errors.login.message}
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <CFormLabel htmlFor="password" className="fw-semibold mb-2 d-block">
                      Contraseña
                    </CFormLabel>
                    <div className="p-input-icon-left" style={{ maxWidth: '100%', position: 'relative' }}>
                    <Password
                      id="password"
                      value={watch('password') || ''}
                      onChange={(e) => setValue('password', e.target.value)}
                      placeholder="Ingrese su contraseña"
                      toggleMask
                      feedback={false}
                      disabled={loading}
                      className={errors.password ? 'p-invalid' : ''}
                      inputStyle={{ 
                        paddingLeft: '2.5rem',
                          paddingTop: '0.65rem',
                          paddingBottom: '0.65rem',
                          fontSize: '0.95rem'
                      }}
                      style={{ width: '100%' }}
                    />
                      <i 
                        className="p-input-icon pi pi-lock"
                        style={{
                          position: 'absolute',
                          left: '0.75rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          zIndex: 2,
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                    {errors.password && (
                      <small className="text-danger d-block mt-2">
                        {errors.password.message}
                      </small>
                    )}
                  </div>

                  <Button
                    type="submit"
                    label="Iniciar Sesión"
                    icon="pi pi-sign-in"
                    className="w-100 p-button-sm"
                    loading={loading}
                    style={{
                      background: '#001a79',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.75rem',
                      fontSize: '0.95rem',
                      fontWeight: '500'
                    }}
                  />
                </CForm>

                <Divider className="my-4">
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>Credenciales de Prueba</span>
                </Divider>

                <div className="text-center mb-4">
                  <CAlert color="info" className="py-2" style={{ fontSize: '0.9rem' }}>
                    <strong>Usuario:</strong> admin | <strong>Contraseña:</strong> password
                  </CAlert>
                </div>

                <div className="text-center">
                  <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                    Policía Municipal de Baruta
                  </small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>

      {/* Footer */}
      <div
        className="position-fixed bottom-0 start-0 end-0 text-center py-3"
        style={{ color: 'rgba(255,255,255,0.8)' }}
      >
        <small>
          © 2024 SICONVIS - Sistema de Control de Visitantes
        </small>
      </div>
    </div>
  )
}

export default Login