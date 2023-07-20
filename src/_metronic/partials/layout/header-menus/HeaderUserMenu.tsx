/* eslint-disable jsx-a11y/anchor-is-valid */
import {FC} from 'react'
import {useAuth} from '../../../../app/modules/auth'

const HeaderUserMenu: FC = () => {
  const {logout} = useAuth()

  const userLogout = (): void => {
    localStorage.removeItem('user')
    logout()
    document.location.reload()
  }
  return (
    <div
      className='menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px'
      data-kt-menu='true'
    >
      <div className='menu-item px-5'>
        <a onClick={userLogout} className='menu-link px-5'>
          Sign Out
        </a>
      </div>
    </div>
  )
}

export {HeaderUserMenu}
