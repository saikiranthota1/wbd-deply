import { useEffect, useState } from 'react';

import { ChevronDown, ChevronUp, Star } from 'lucide-react';
import ReviewsPopup from './ReviewsPopup'

export default function GrantApplicationComponent({ grantSchemes }) {
  const [openApplicant, setOpenApplicant] = useState(null);
  const [openProject, setOpenProject] = useState(null);
  const [updatedSchemes, setUpdatedSchemes] = useState(grantSchemes);
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (requestId) => {
    setOpenSections((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };
  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-200 text-green-800';
      case 'Rejected': return 'bg-red-200 text-red-800';
      case 'In Progress': return 'bg-yellow-200 text-yellow-800';
      case 'Short Listed': return 'bg-blue-200 text-blue-800';
      case 'Under Review': return 'bg-purple-200 text-purple-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };
  const toggleProjectDropdown = (id) => {
    setOpenProject(openProject === id ? null : id);
  };

  const toggleApplicantDropdown = (id) => {
    setOpenApplicant(openApplicant === id ? null : id);
  };

  const updateGrantStatus = async (id, status, apiEndpoint) => {
    const isConfirmed = window.confirm(`Are you sure you want to mark this grant as ${status}?`);
    if (isConfirmed) {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grantId: id, status }),
        });

        if (response.ok) {
          console.log(`Grant request ${status} successfully`);

          setUpdatedSchemes(prevSchemes =>
            prevSchemes.map(scheme =>
              scheme._id === id ? { ...scheme, grant_status: { status } } : scheme
            )
          );
        } else {
          console.error(`Failed to ${status.toLowerCase()} the grant request`);
        }
      } catch (error) {
        console.error(`An error occurred while ${status.toLowerCase()} the grant request:`, error);
      }
    }
  };

  const handleReject = (id) => updateGrantStatus(id, 'Rejected', 'admin/grant/reject');
  const handleAccept = (id) => updateGrantStatus(id, 'Approved', 'admin/grant/accept');
  const handleInProgress = (id) => updateGrantStatus(id, 'In Progress', 'admin/grant/progress');

  // Custom sorting function
  const sortSchemes = (schemes) => {
    const order = ['Applied', 'In Progress', 'Approved', 'Rejected'];
    return [...schemes].sort((a, b) => {
      return order.indexOf(a.grant_status.status) - order.indexOf(b.grant_status.status);
    });
  };

  // Effect to sort schemes whenever updatedSchemes changes
  useEffect(() => {
    setUpdatedSchemes(sortSchemes(grantSchemes));
  }, [grantSchemes]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
        Grant Scheme Applications
      </h1>

      {sortSchemes(updatedSchemes).map((scheme) => (
        <div key={scheme._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden mb-8 transition-all duration-300 hover:shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2
                className="text-2xl font-semibold cursor-pointer text-gray-800 hover:text-purple-600 transition-colors duration-300"
                onClick={() => toggleProjectDropdown(scheme._id)}
              >
                {scheme.project_proposal.project_title}
                <span className="ml-2 text-purple-600">
                  {openProject === scheme._id ? <ChevronUp className="inline-block" /> : <ChevronDown className="inline-block" />}
                </span>
              </h2>
              <p className="text-gray-500">
                Submitted by {scheme.applicant.name} on{' '}
                {new Date(scheme.created_at).toLocaleDateString()}
              </p>
            </div>

            {openProject === scheme._id && (
              <div className="mt-6 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold mb-4 text-purple-800">Project Proposal</h3>
                <div className="space-y-4">
                  <p className="text-gray-700">
                    <span className="font-semibold text-purple-600">Description:</span> {scheme.project_proposal.description}
                  </p>
                  <div>
                    <p className="font-semibold text-purple-600 mb-2">Objectives:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      {scheme.project_proposal.objectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold text-purple-600">
                      Total Funding Required: <span className="text-gray-700">${scheme.project_proposal.budget.total_funding_required.toLocaleString()}</span>
                    </p>
                    <p className="font-semibold text-purple-600 mt-2">Funding Breakdown:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                      {scheme.project_proposal.budget.funding_breakdown.map((item, index) => (
                        <li key={index}>
                          {item.item}: <span className="font-semibold">${item.amount.toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-gray-100 pt-6">
              <button
                className="text-xl font-semibold w-full text-left text-gray-800 hover:text-purple-600 transition-colors duration-300"
                onClick={() => toggleApplicantDropdown(scheme._id)}
              >
                Applicant Details
                <span className="ml-2 text-purple-600">
                  {openApplicant === scheme._id ? <ChevronUp className="inline-block" /> : <ChevronDown className="inline-block" />}
                </span>
              </button>

              {openApplicant === scheme._id && (
                <div className="mt-4 bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-purple-800">Applicant Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <p><span className="font-semibold text-purple-600">Name:</span> {scheme.applicant.name}</p>
                    {scheme.applicant.organization && (
                      <p><span className="font-semibold text-purple-600">Organization:</span> {scheme.applicant.organization}</p>
                    )}
                    <p><span className="font-semibold text-purple-600">Email:</span> {scheme.applicant.contact_details.email}</p>
                    {scheme.applicant.contact_details.phone && (
                      <p><span className="font-semibold text-purple-600">Phone:</span> {scheme.applicant.contact_details.phone}</p>
                    )}
                    {scheme.applicant.contact_details.address && (
                      <p><span className="font-semibold text-purple-600">Address:</span> {scheme.applicant.contact_details.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="space-y-4">
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${getStatusColor(scheme.grant_status?.status)}`}
                >
                  {scheme.grant_status?.status || 'N/A'}
                </span>
                <button
                  className="text-lg font-semibold cursor-pointer flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-300"
                  onClick={() => toggleSection(scheme._id)}
                >
                  Reviews
                  <span className="ml-2">
                    {openSections[scheme._id] ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </span>
                </button>
                {openSections[scheme._id] && (
                  <ReviewsPopup request={scheme} toggle={toggleSection} reviews={scheme.reviews}/>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                    scheme.grant_status.status === 'Rejected' || scheme.grant_status.status === 'Approved'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white hover:shadow-xl'
                  }`}
                  onClick={() => handleReject(scheme._id)}
                  disabled={scheme.grant_status.status === 'Rejected' || scheme.grant_status.status === 'Approved'}
                >
                  Reject
                </button>

                <button
                  className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                    scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-xl'
                  }`}
                  onClick={() => handleAccept(scheme._id)}
                  disabled={scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'}
                >
                  Accept
                </button>

                <button
                  className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                    scheme.grant_status.status === 'In Progress' || scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white hover:shadow-xl'
                  }`}
                  onClick={() => handleInProgress(scheme._id)}
                  disabled={scheme.grant_status.status === 'In Progress' || scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'}
                >
                  Mark as ShortListed
                </button>

                <a href={`/grants/selectreviewers/${scheme._id}`}>
                  <button
                    className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
                      scheme.grant_status.status === 'In Progress' || scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white hover:shadow-xl'
                    }`}
                    disabled={scheme.grant_status.status === 'In Progress' || scheme.grant_status.status === 'Approved' || scheme.grant_status.status === 'Rejected'}
                  >
                    Select Reviewers
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
