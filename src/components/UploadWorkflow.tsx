'use client';

import React from 'react';
import { Play, Share2, Clock } from 'lucide-react';

interface UploadWorkflowProps {
  type: string;
}

export default function UploadWorkflow({ type }: UploadWorkflowProps) {
  const steps = [
    {
      number: 1,
      title: 'Upload',
      description: `Click on the upload button to upload the ${type} file`,
    },
    {
      number: 2,
      title: 'Map the sheet data',
      description: 'Map the Excel sheet data with Tally fields',
    },
    {
      number: 3,
      title: 'Save Transaction',
      description: 'Select the ledger, other details and click on the save button',
    },
    {
      number: 4,
      title: 'Send to Tally',
      description: 'Click on Send to Tally button to sync the transactions',
    },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Text */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-medium text-blue-500">
            Please follow below the steps to upload a {type} file
          </h1>
        </div>

        {/* YouTube Video Embed */}
        <div className="flex justify-center mb-16">
          <div className="w-full max-w-2xl">
            <div className="bg-gradient-to-b from-blue-500 to-blue-700 rounded-lg overflow-hidden shadow-lg">
              <div className="aspect-video bg-gradient-to-b from-blue-500 to-blue-700 flex flex-col items-center justify-center p-8 relative">
                {/* Channel Info */}
                <div className="absolute top-6 left-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                    <Play size={18} className="text-white fill-white" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm font-medium">Vyapar Channel</p>
                  </div>
                </div>

                {/* Video Title */}
                <p className="text-white text-center text-lg font-medium mb-8 mt-12">
                  How to upload {type} file
                </p>

                {/* Play Button */}
                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-lg">
                  <Play size={48} className="text-white fill-white" />
                </div>

                {/* Footer Actions */}
                <div className="absolute bottom-6 w-full flex items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <button className="text-white hover:text-gray-200 transition-colors">
                      <Share2 size={20} />
                    </button>
                    <button className="text-white hover:text-gray-200 transition-colors">
                      <Clock size={20} />
                    </button>
                  </div>
                  <button className="bg-white text-blue-600 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100 transition-colors">
                    Watch on YouTube
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Stepper */}
        <div className="mb-16">
          {/* Timeline */}
          <div className="flex items-center justify-between mb-12 px-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                {/* Step Circle */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center font-bold text-blue-600 mb-6">
                    {step.number}
                  </div>
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-blue-200 mx-2 mb-12" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step Cards */}
          <div className="grid grid-cols-4 gap-6">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-6 pt-8 border-t border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">Mascot</span>
          </div>
          <p className="text-gray-700">
            If you want to read documentation:{' '}
            <a href="#" className="text-blue-500 hover:text-blue-600 font-medium">
              Click here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
