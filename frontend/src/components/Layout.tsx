import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  CSidebar,
  CSidebarBrand,
  CSidebarNav,
  CSidebarToggler,
  CHeader,
  CHeaderBrand,
  CHeaderToggler,
  CHeaderNav,
  CNavbar,
  CContainer,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarShow, setSidebarShow] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="c-app c-default-layout">
      <CSidebar
        position="fixed"
        visible={sidebarShow}
        unfoldable={false}
        onVisibleChange={(visible) => setSidebarShow(visible)}
        className={sidebarShow ? 'c-sidebar-show' : ''}
        style={{ 
          width: '250px',
          minWidth: '250px',
          maxWidth: '250px',
          flexShrink: 0
        }}
      >
        <CSidebarBrand className="d-none d-md-flex">
          <div className="w-100 d-flex flex-column align-items-center">
            <img 
              src="/bannerSiconvis.png"
              alt="SICONVIS"
              style={{
                width: '100%',
                maxHeight: '100px',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid var(--police-blue-light)'
              }}
            />
          </div>
        </CSidebarBrand>
        <CSidebarNav>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/dashboard')}
              className={location.pathname === '/dashboard' ? 'active' : ''}
            >
              <CIcon icon="cil-home" customClassName="nav-icon" />
              Dashboard
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/visitantes')}
              className={location.pathname === '/visitantes' ? 'active' : ''}
            >
              <CIcon icon="cil-user" customClassName="nav-icon" />
              Visitantes
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/departamentos')}
              className={location.pathname === '/departamentos' ? 'active' : ''}
            >
              <CIcon icon="cil-building" customClassName="nav-icon" />
              Departamentos
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/visitas')}
              className={location.pathname === '/visitas' ? 'active' : ''}
            >
              <CIcon icon="cil-calendar" customClassName="nav-icon" />
              Registro de Visitas
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/reportes')}
              className={location.pathname === '/reportes' ? 'active' : ''}
            >
              <CIcon icon="cil-chart" customClassName="nav-icon" />
              Reportes
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink 
              onClick={() => handleNavigation('/configuracion')}
              className={location.pathname === '/configuracion' ? 'active' : ''}
            >
              <CIcon icon="cil-settings" customClassName="nav-icon" />
              Configuración
            </CNavLink>
          </CNavItem>
        </CSidebarNav>
        <CSidebarToggler />
      </CSidebar>
      <div className={`wrapper c-default-layout ${sidebarShow ? 'sidebar-open' : 'sidebar-closed'}`}>
        <CHeader className="c-header navbar">
          <CContainer fluid>
            <CHeaderToggler
              className="ms-3"
              onClick={() => setSidebarShow(!sidebarShow)}
            >
              <CIcon icon="cil-menu" />
            </CHeaderToggler>
            <CHeaderBrand className="mx-auto d-md-none">
              <CIcon icon="cil-car" height={48} />
            </CHeaderBrand>
            <CHeaderNav className="ms-auto">
              <CNavbar className="d-flex align-items-center">
                
                <CDropdown variant="nav-item" placement="bottom-end">
                  <CDropdownToggle className="py-0 text-white d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-sm">
                        <CIcon icon="cil-user" className="avatar-icon" style={{ color: '#ffffff' }} />
                      </div>
                      <div className="ms-2 d-none d-sm-block text-white">
                        <div className="fw-bold text-white">{user?.nombre} {user?.apellido}</div>
                        <small className="text-white">{user?.login}</small>
                      </div>
                    </div>
                  </CDropdownToggle>
                  <CDropdownMenu className="dropdown-menu-end">
                    <CDropdownItem href="#" onClick={handleLogout}>
                      <CIcon icon="cil-account-logout" className="me-2" />
                      Cerrar Sesión
                    </CDropdownItem>
                  </CDropdownMenu>
                </CDropdown>
              </CNavbar>
            </CHeaderNav>
          </CContainer>
        </CHeader>
        <div className="body flex-grow-1 px-3">
          <CContainer fluid className="py-4">
            {children}
          </CContainer>
        </div>
      </div>
    </div>
  )
}

export default Layout