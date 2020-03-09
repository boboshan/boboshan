/** @jsx jsx */
import React from "react"
import { jsx, Flex } from 'theme-ui'

const Layout = ({ children }) => {
  return (
      <Flex as='main' 
        sx={{justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
      }}>
          {children}
      </Flex>
  )
}

export default Layout
