import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Settings, MessageSquare, Bell, User, Sparkles, ArrowRight, Zap } from 'lucide-react';

const QuestionnaireTemplateBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('Entity Tax Filing');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedSectionForAi, setSelectedSectionForAi] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showInputBox, setShowInputBox] = useState(false);

  const templates = [
    'Entity Tax Filing',
    'Comprehensive Tax Filing',
    'Simple Tax Filing'
  ];

  const initialSections = [
    { id: 1, name: 'Introduction', questionCount: 0 },
    { id: 2, name: 'Engagement Letter', questionCount: 0 },
    { id: 3, name: 'New Entity Information', questionCount: 3 },
    { id: 4, name: 'General Information', questionCount: 1 },
    { id: 5, name: 'Financial Statement', questionCount: 1 },
    { id: 6, name: 'Supporting Document', questionCount: 3 },
    { id: 7, name: 'Tax Payment', questionCount: 2 },
    { id: 8, name: 'State Information', questionCount: 1 },
    { id: 9, name: 'Other Information', questionCount: 2 },
    { id: 10, name: 'Review & Submit', questionCount: 0 }
  ];

  const [sections, setSections] = useState(initialSections);

  const quickActions = [
    { 
      id: 'add-questions',
      icon: <Plus size={18} />,
      title: 'Add questions',
      description: 'Generate relevant questions for this section',
      color: 'blue'
    },
    { 
      id: 'improve',
      icon: <Sparkles size={18} />,
      title: 'Improve section',
      description: 'Enhance clarity and completeness',
      color: 'purple'
    },
    { 
      id: 'suggest',
      icon: <Zap size={18} />,
      title: 'Get suggestions',
      description: 'AI-powered recommendations',
      color: 'amber'
    }
  ];

  const toggleSection = (id: number) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      name: 'New Section',
      questionCount: 0
    };
    setSections([...sections, newSection]);
  };

  const handleAiAction = (actionId: string, sectionId: number) => {
    setIsGenerating(true);
    setAiResponse('');

    setTimeout(() => {
      const section = sections.find(s => s.id === sectionId);
      let response = '';

      if (actionId === 'add-questions') {
        response = `Here are suggested questions for "${section?.name}":\n\n1. What is the primary purpose of this information?\n2. Are there any specific deadlines we should be aware of?\n3. Who should we contact if we have questions?`;
      } else if (actionId === 'improve') {
        response = `Improvements for "${section?.name}":\n\n• Add a brief description explaining what information is needed\n• Include examples for complex fields\n• Consider breaking down into sub-sections if there are multiple topics`;
      } else if (actionId === 'suggest') {
        response = `Suggestions for "${section?.name}":\n\n• This section could benefit from conditional logic\n• Consider adding file upload capability\n• Add validation rules to ensure data quality`;
      }

      setAiResponse(response);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSectionAiClick = (e: React.MouseEvent, sectionId: number) => {
    e.stopPropagation();
    setSelectedSectionForAi(sectionId);
    setShowAiPanel(true);
    setAiResponse('');
  };

  const applyAiSuggestion = () => {
    setShowAiPanel(false);
    setAiResponse('');
    setSelectedSectionForAi(null);
  };

  const handleUserInput = () => {
    if (!userInput.trim()) return;
    
    setIsGenerating(true);
    setAiResponse('');
    
    setTimeout(() => {
      const response = `Based on your request: "${userInput}"\n\nHere's what I can help you with:\n\n• I can analyze your template structure and suggest improvements\n• I can generate specific questions for any section\n• I can help optimize the flow and organization\n• I can provide best practices for questionnaire design\n\nWould you like me to focus on any specific aspect of your template?`;
      setAiResponse(response);
      setIsGenerating(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const selectedSection = sections.find(s => s.id === selectedSectionForAi);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-900">Soraban</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <MessageSquare size={20} />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
              <Bell size={20} />
            </button>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={18} className="text-white" />
              </div>
              <div className="text-sm">
                <div className="font-medium text-gray-900">Alice Advisor</div>
                <div className="text-gray-500">Staff</div>
              </div>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button and Title */}
        <div className="mb-6">
          <button className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <span className="mr-2">←</span>
            <span className="text-2xl font-bold text-gray-900">Questionnaire Templates</span>
          </button>
        </div>

        {/* Search and Create Button */}
        <div className="flex items-center justify-between mb-6">
          <input
            type="text"
            placeholder="Search Templates"
            className="px-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="flex items-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
            <Plus size={18} className="mr-2" />
            Create a template
          </button>
        </div>

        {/* Template Tabs */}
        <div className="flex space-x-2 mb-6">
          {templates.map(template => (
            <button
              key={template}
              onClick={() => setSelectedTemplate(template)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTemplate === template
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {template}
            </button>
          ))}
        </div>

        {/* Template Content with Grid Layout */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Template Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">{selectedTemplate}</h2>
                <div className="flex items-center space-x-4">
                  <button className="text-sm text-blue-600 hover:text-blue-700">Send Me a Test</button>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Show Preview</button>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Create Template Link</button>
                  <button className="text-sm text-blue-600 hover:text-blue-700">Edit Messages</button>
                  <button className="p-2 text-gray-600 hover:bg-gray-100 rounded">
                    <Settings size={18} />
                  </button>
                </div>
              </div>

              {/* Sections Header */}
              <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">Sections</span>
                  <div className="w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs">
                    i
                  </div>
                </div>
                <button onClick={() => setExpandedSections({})} className="text-gray-600 hover:text-gray-900">
                  <ChevronUp size={18} />
                </button>
              </div>

              {/* Sections List */}
              <div className="divide-y divide-gray-200">
                {sections.map(section => (
                  <div key={section.id} className="px-6 py-4 group">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-6 px-6 py-2 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex flex-col space-y-0.5">
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                          <div className="w-4 h-0.5 bg-gray-400"></div>
                        </div>
                        <span className="font-medium text-gray-900">{section.name}</span>
                        {section.questionCount > 0 && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {section.questionCount}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleSectionAiClick(e, section.id)}
                          className={`opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg ${
                            selectedSectionForAi === section.id 
                              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                              : 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-blue-500 hover:text-white text-gray-600'
                          }`}
                          title="AI Copilot"
                        >
                          <Sparkles size={16} />
                        </button>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`text-gray-400 transition-transform ${
                          expandedSections[section.id] ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedSections[section.id] && (
                      <div className="mt-4 ml-7 p-4 bg-gray-50 rounded text-sm text-gray-600">
                        Section content and questions would appear here...
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Section Button */}
              <div className="px-6 py-6 border-t border-gray-200 flex justify-center">
                <button
                  onClick={addSection}
                  className="flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Plus size={18} className="mr-2" />
                  Add Section
                </button>
              </div>

              {/* Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center space-x-3">
                <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50">
                  Export Template
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Duplicate Template
                </button>
                <button className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50">
                  Delete Template
                </button>
              </div>
            </div>
          </div>

          {/* AI Copilot Side Panel */}
          <div className="col-span-1">
            <div className={`bg-white rounded-lg shadow-sm border-2 transition-all ${
              showAiPanel ? 'border-purple-500' : 'border-gray-200'
            }`}>
              <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-blue-500">
                <div className="flex items-center space-x-2">
                  <Sparkles size={20} className="text-white" />
                  <h3 className="font-semibold text-white">Template Copilot</h3>
                </div>
              </div>

              {!showAiPanel ? (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles size={32} className="text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Assistant</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Ask me anything about your template or select a section for specific help
                    </p>
                  </div>
                  
                  {/* Input Box */}
                  <div className="mb-6">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                      <div className="relative bg-white rounded-xl border-2 border-gray-200 focus-within:border-purple-400 transition-all shadow-sm">
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything about your template..."
                          className="w-full px-4 py-3 pr-14 text-sm bg-transparent focus:outline-none resize-none placeholder-gray-400"
                          rows={3}
                        />
                        <button
                          onClick={handleUserInput}
                          disabled={!userInput.trim() || isGenerating}
                          className="absolute bottom-3 right-3 p-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                          title="Send message (Enter)"
                        >
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">Press Enter to send, Shift+Enter for new line</p>
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <span className="text-purple-600">✓</span>
                      <span>Generate questions automatically</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <span className="text-purple-600">✓</span>
                      <span>Improve section structure</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <span className="text-purple-600">✓</span>
                      <span>Get smart suggestions</span>
                    </div>
                    <div className="flex items-start space-x-2 text-xs text-gray-600">
                      <span className="text-purple-600">✓</span>
                      <span>Answer custom questions</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Selected section</div>
                    <div className="font-medium text-gray-900">{selectedSection?.name}</div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {quickActions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => handleAiAction(action.id, selectedSectionForAi!)}
                        className="w-full flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                      >
                        <div className={`p-2 rounded-lg bg-${action.color}-100 text-${action.color}-600`}>
                          {action.icon}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm">{action.title}</div>
                          <div className="text-xs text-gray-600">{action.description}</div>
                        </div>
                        <ArrowRight size={16} className="text-gray-400 mt-2" />
                      </button>
                    ))}
                  </div>

                  {/* Custom Input for Section */}
                  <div className="mb-4">
                    <div className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                      <span className="mr-1">💬</span>
                      Or ask a custom question:
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 rounded-lg blur-sm opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      <div className="relative bg-white rounded-lg border-2 border-gray-200 focus-within:border-purple-400 transition-all">
                        <textarea
                          value={userInput}
                          onChange={(e) => setUserInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask about this section..."
                          className="w-full px-3 py-2.5 pr-12 text-sm bg-transparent focus:outline-none resize-none placeholder-gray-400"
                          rows={2}
                        />
                        <button
                          onClick={handleUserInput}
                          disabled={!userInput.trim() || isGenerating}
                          className="absolute bottom-2 right-2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                          title="Send message"
                        >
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {isGenerating && (
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-purple-700">Generating...</span>
                      </div>
                    </div>
                  )}

                  {aiResponse && !isGenerating && (
                    <div className="space-y-3">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{aiResponse}</p>
                      </div>
                      <button
                        onClick={applyAiSuggestion}
                        className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium"
                      >
                        Apply Suggestion
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 space-x-4">
          <a href="#" className="hover:text-gray-700">Terms of Service</a>
          <a href="#" className="hover:text-gray-700">Privacy Policy</a>
          <a href="#" className="hover:text-gray-700">Help</a>
        </div>
      </div>

    </div>
  );
};

export default QuestionnaireTemplateBuilder;
