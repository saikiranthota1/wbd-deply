'use client'

import Cookie from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AdminNavbar from './AdminNavbar'
import EIRRequests from './EirRequests'
import GrantApplicationComponent from './GrantRequests'
import StartupMessages from './Messages'
import AdsComponent from './Ads'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import Reviewrs from './Reviewrs'
import Reviewers from './Reviewrs'


export default function Admin() {
  const [selectedTab, setSelectedTab] = useState('startups')
  const [isExpanded, setIsExpanded] = useState(true)
  const [startups, setStartups] = useState([])
  const [eirRequests, setEirRequests] = useState([])
  const [grantRequests, setGrantRequests] = useState([])
  const [visibleDetails, setVisibleDetails] = useState(null)

  useEffect(() => {
    fetch('admin/startups')
      .then((response) => response.json())
      .then((data) => setStartups(data))
      .catch((error) => console.error('Error fetching startups:', error))
  }, [])
  const navigate = useNavigate()
  useEffect(() => {
    fetch('admin/eir-requests')
      .then((response) => response.json())
      .then((data) => setEirRequests(data))
      .catch((error) => console.error('Error fetching EIR requests:', error))
  }, [])

  useEffect(() => {
    fetch('admin/grant-requests')
      .then((response) => response.json())
      .then((data) => setGrantRequests(data.reverse()))
      .catch((error) => console.error('Error fetching grant requests:', error))
  }, [])
  useEffect(() => {
   const admin= Cookie.get('admin')
   if (!admin){
    navigate('/admin/login')
   }
  }, [])
  const toggleDetails = (startupId) => {
    setVisibleDetails((prevId) => (prevId === startupId ? null : startupId))
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavbar
        selectedTab={selectedTab}
        setSelectedTab={setSelectedTab}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />

      <div className="flex-1 p-8 overflow-auto">
        {selectedTab === 'startups' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Startups
            </h2>
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <th className="py-4 px-6 text-left font-semibold">Company Name</th>
                    <th className="py-4 px-6 text-left font-semibold">Industry</th>
                    <th className="py-4 px-6 text-left font-semibold">Created At</th>
                    <th className="py-4 px-6 text-left font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {startups.map((startup) => (
                    <React.Fragment key={startup._id}>
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-300">
                        <td className="py-4 px-6 text-gray-700">{startup.kyc?.company_name || 'N/A'}</td>
                        <td className="py-4 px-6 text-gray-700">{startup.kyc?.company_details?.industry || 'N/A'}</td>
                        <td className="py-4 px-6 text-gray-700">
                          {startup.kyc.created_at
                            ? new Date(startup.kyc.created_at).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="py-4 px-6">
                          <motion.button
                            onClick={() => toggleDetails(startup._id)}
                            className="flex items-center justify-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {visibleDetails === startup._id ? (
                              <>
                                Hide Details
                                <ChevronUp className="ml-2" size={16} />
                              </>
                            ) : (
                              <>
                                View Details
                                <ChevronDown className="ml-2" size={16} />
                              </>
                            )}
                          </motion.button>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {visibleDetails === startup._id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <td colSpan={4}>
                              <div className="p-8 bg-gradient-to-br from-purple-50 to-indigo-50">
                                <h3 className="text-2xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
                                  {startup.kyc?.company_name || 'N/A'} Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <DetailItem label="Industry" value={startup.kyc?.company_details?.industry} />
                                  <DetailItem label="Website" value={startup.kyc?.company_details?.website} />
                                  <DetailItem label="Contact Person" value={startup.kyc?.contact_person?.name} />
                                  <DetailItem label="Contact Email" value={startup.kyc?.contact_person?.email} />
                                  <DetailItem label="Contact Phone" value={startup.kyc?.contact_person?.phone} />
                                  <Link 
                                    className="font-semibold text-purple-600 hover:text-purple-800 transition-colors duration-300" 
                                    to={`/progress/${startup._id}`}
                                  >
                                    Progress
                                  </Link>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedTab === 'eirrequests' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              EIR Requests
            </h2>
            <EIRRequests eirRequests={eirRequests} />
          </div>
        )}

        {selectedTab === 'grantsrequests' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Grant Requests
            </h2>
            <GrantApplicationComponent grantSchemes={grantRequests} />
          </div>
        )}
       
        {selectedTab === 'reviewers' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Reviewers
            </h2>
            <Reviewers />
          </div>
        )}

        {selectedTab === 'messages' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Messages
            </h2>
            <StartupMessages />
          </div>
        )}

        {selectedTab === 'ads' && (
          <div className="space-y-8">
            <h2 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
              Advertisements
            </h2>
            <AdsComponent />
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <span className="font-semibold text-purple-600">{label}:</span>{' '}
      <span className="text-gray-700">{value || 'N/A'}</span>
    </div>
  )
}

