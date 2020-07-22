import clsx from "clsx"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import React from "react"

import Layout from "@theme/Layout"

import {
  Cards,
  Console,
  Feature,
  Head,
  HomeContextProvider,
  GetStarted,
  Jumbotron,
  QueryScroller,
  Why,
} from "../components"

const Home = () => {
  const context = useDocusaurusContext()
  const { siteConfig = {} } = context

  return (
    <HomeContextProvider value>
      <Layout description={siteConfig.tagline} title="QuestDB" version="5.0.1">
        <Head fonts />
        <Jumbotron />
        <Feature />
        <QueryScroller />
        <Why />
        <Cards />
        <Console />
        <GetStarted />
      </Layout>
    </HomeContextProvider>
  )
}

export default Home