/** @jsx jsx */
import React from 'react'
import { Link } from 'gatsby'
import { jsx, Heading, Box } from 'theme-ui'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'

const IndexPage = () => (
  <Layout>
    <SEO title='BBSBB'/>
    <Box as='section'>
      <Heading variant='caps'>Coming Soon</Heading>
      <a href='https://owl.monster/'>-> O W L | owl.monster</a>
    </Box>
  </Layout>
)

export default IndexPage
