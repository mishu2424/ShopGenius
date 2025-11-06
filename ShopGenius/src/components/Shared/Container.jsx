/* eslint-disable react/prop-types */
const Container = ({ children }) => {
  return (
    <div className='max-w-[2550px] mx-auto md:px-10 sm:px-2 px-4'>
      {children}
    </div>
  )
}

export default Container