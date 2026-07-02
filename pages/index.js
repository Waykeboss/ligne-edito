import Head from 'next/head'
import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import TabFondations from '../components/TabFondations'
import TabStrategie from '../components/TabStrategie'
import TabContenu from '../components/TabContenu'
import TabPublication from '../components/TabPublication'
import TabAnalyse from '../components/TabAnalyse'
import { useToast } from '../components/Toast'
import { loadOffresFromNotion } from '../lib/api'

export default function Home() {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('fondations')
  const [offres, setOffres] = useState([])
  const [selectedOffre, setSelectedOffre] = useState(null)
  const [ficheSelectionnee, setFicheSelectionnee] = useState(null)
  const [publicationData, setPublicationData] = useState(null)

  useEffect(() => {
    if (!localStorage.getItem('anthropic_key') || !localStorage.getItem('notion_token')) {
      setTimeout(() => toast('⚙️ Configure tes clés API dans Config pour commencer', 'info'), 300)
    } else {
      loadOffres()
    }
  }, [])

  async function loadOffres() {
    try {
      const data = await loadOffresFromNotion()
      setOffres(data)
      if (data.length > 0) toast(`${data.length} offre(s) chargée(s)`, 'success')
    } catch (e) {
      toast('Erreur chargement offres : ' + e.message, 'error')
    }
  }

  function handleSelectOffre(id) {
    if (!id) { setSelectedOffre(null); return }
    const offre = offres.find(o => o.id === id)
    if (offre) {
      setSelectedOffre(offre)
      toast(`Offre "${offre.nom}" sélectionnée`, 'success')
    }
  }

  return (
    <>
      <Head>
        <title>Système Editorial IA — House Lab</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>

      <Header />
      <Tabs active={activeTab} onChange={setActiveTab} />

      <div className={`panel${activeTab === 'fondations' ? ' active' : ''}`}>
        <TabFondations onSwitchTab={setActiveTab} />
      </div>
      <div className={`panel${activeTab === 'strategie' ? ' active' : ''}`}>
        <TabStrategie offres={offres} selectedOffre={selectedOffre} onSelectOffre={handleSelectOffre} />
      </div>
      <div className={`panel${activeTab === 'contenu' ? ' active' : ''}`}>
        <TabContenu
          offres={offres}
          selectedOffre={selectedOffre}
          onSelectOffre={handleSelectOffre}
          onSwitchTab={setActiveTab}
          ficheSelectionnee={ficheSelectionnee}
          setFicheSelectionnee={setFicheSelectionnee}
          setPublicationData={setPublicationData}
        />
      </div>
      <div className={`panel${activeTab === 'publication' ? ' active' : ''}`}>
        <TabPublication publicationData={publicationData} />
      </div>
      <div className={`panel${activeTab === 'analyse' ? ' active' : ''}`}>
        <TabAnalyse />
      </div>
    </>
  )
}
