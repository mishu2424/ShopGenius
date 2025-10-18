import { useContext } from 'react'
import { AuthContext } from '../Contexts/AuthContext';

const useAuth = () => {
  const auth = useContext(AuthContext)
  return auth
}

export default useAuth;