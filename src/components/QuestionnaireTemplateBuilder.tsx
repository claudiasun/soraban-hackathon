import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Settings, MessageSquare, Bell, User, Sparkles, ArrowRight, Zap, X, Loader, Copy, Edit2, Trash2 } from 'lucide-react';

const QuestionnaireTemplateBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('Entity Tax Filing');
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [selectedSectionForAi, setSelectedSectionForAi] = useState<number | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [showInputBox, setShowInputBox] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateType, setNewTemplateType] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentActionType, setCurrentActionType] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ sectionId: number; questionIndex: number; text: string } | null>(null);
  const [editingSection, setEditingSection] = useState<{ id: number; name: string } | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [showNewQuestionModal, setShowNewQuestionModal] = useState<number | null>(null);

  const [templates, setTemplates] = useState([
    'Entity Tax Filing',
    'Comprehensive Tax Filing',
    'Simple Tax Filing'
  ]);

  const initialSections = [
    { id: 1, name: 'Introduction', questionCount: 0, questions: [] as string[] },
    { id: 2, name: 'Engagement Letter', questionCount: 0, questions: [] as string[] },
    { id: 3, name: 'New Entity Information', questionCount: 3, questions: [] as string[] },
    { id: 4, name: 'General Information', questionCount: 1, questions: [] as string[] },
    { id: 5, name: 'Financial Statement', questionCount: 1, questions: [] as string[] },
    { id: 6, name: 'Supporting Document', questionCount: 3, questions: [] as string[] },
    { id: 7, name: 'Tax Payment', questionCount: 2, questions: [] as string[] },
    { id: 8, name: 'State Information', questionCount: 1, questions: [] as string[] },
    { id: 9, name: 'Other Information', questionCount: 2, questions: [] as string[] },
    { id: 10, name: 'Review & Submit', questionCount: 0, questions: [] as string[] }
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
      questionCount: 0,
      questions: [] as string[]
    };
    setSections([...sections, newSection]);
  };

  const handleAiAction = async (actionId: string, sectionId: number) => {
    setIsGenerating(true);
    setAiResponse('');
    setCurrentActionType(actionId);

    try {
      const section = sections.find(s => s.id === sectionId);
      
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actionType: actionId,
          sectionName: section?.name,
          sectionId: sectionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.response);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('AI Action error:', error);
      setAiResponse(`I encountered an error while processing your request. Please try again or contact support if the issue persists.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSectionAiClick = (e: React.MouseEvent, sectionId: number) => {
    e.stopPropagation();
    setSelectedSectionForAi(sectionId);
    setShowAiPanel(true);
    setAiResponse('');
  };

  const applyAiSuggestion = () => {
    if (currentActionType === 'add-questions' && selectedSectionForAi && aiResponse) {
      // Parse the AI response to extract questions
      // Questions are typically formatted as numbered lists (1. Question, 2. Question, etc.)
      const questionMatches = aiResponse.match(/^\d+\.\s+(.+)$/gm) || [];
      
      if (questionMatches.length > 0) {
        // Extract the actual question text (remove the number prefix)
        const questions = questionMatches.map(q => q.replace(/^\d+\.\s+/, '').trim());
        
        // Update the section with the new questions
        setSections(prevSections => 
          prevSections.map(section => 
            section.id === selectedSectionForAi 
              ? { 
                  ...section, 
                  questionCount: section.questionCount + questions.length,
                  questions: [...(section.questions || []), ...questions]
                }
              : section
          )
        );
        
        // Show success message
        const sectionName = sections.find(s => s.id === selectedSectionForAi)?.name || 'section';
        setAiResponse(`✅ Successfully added ${questions.length} question${questions.length > 1 ? 's' : ''} to "${sectionName}"!`);
        
        // Close panel after a brief delay
        setTimeout(() => {
          setShowAiPanel(false);
          setAiResponse('');
          setSelectedSectionForAi(null);
          setCurrentActionType(null);
        }, 1500);
        
        return;
      }
    }
    
    // Default behavior for other actions
    setShowAiPanel(false);
    setAiResponse('');
    setSelectedSectionForAi(null);
    setCurrentActionType(null);
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;
    
    setIsGenerating(true);
    setAiResponse('');
    
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
          sectionName: selectedSection?.name,
          sectionId: selectedSectionForAi
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI assistance');
      }

      const data = await response.json();
      
      if (data.success) {
        setAiResponse(data.response);
        setUserInput(''); // Clear input after successful submission
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('User input error:', error);
      setAiResponse(`I encountered an error while processing your question. Please try again or contact support if the issue persists.\n\nError: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleUserInput();
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateType.trim()) {
      alert('Please enter a template type');
      return;
    }

    setIsCreatingTemplate(true);

    try {
      const response = await fetch('/api/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateType: newTemplateType.trim(),
          description: newTemplateDescription.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate template');
      }

      const data = await response.json();

      if (data.success && data.template) {
        // Add the new template to the list
        const newTemplateName = data.template.templateName;
        setTemplates(prev => [...prev, newTemplateName]);
        
        // Switch to the new template
        setSelectedTemplate(newTemplateName);
        
        // Update sections with the generated ones
        setSections(data.template.sections);
        
        // Close modal and reset form
        setShowCreateModal(false);
        setNewTemplateType('');
        setNewTemplateDescription('');
        
        // Show success message in AI panel
        setShowAiPanel(true);
        setAiResponse(`✅ Successfully created "${newTemplateName}" template!\n\nResearch findings:\n${data.research}\n\nThe template includes ${data.template.sections.length} sections tailored for ${newTemplateType}.`);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Template creation error:', error);
      alert(`Failed to create template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingTemplate(false);
    }
  };

  const handleDeleteTemplate = () => {
    // Remove the template from the list
    const updatedTemplates = templates.filter(t => t !== selectedTemplate);
    setTemplates(updatedTemplates);
    
    // Switch to the first remaining template
    if (updatedTemplates.length > 0) {
      setSelectedTemplate(updatedTemplates[0]);
      // Reset to default sections when switching templates
      setSections(initialSections);
    }
    
    // Close the modal
    setShowDeleteModal(false);
    
    // Show success message
    setShowAiPanel(true);
    setAiResponse(`✅ Successfully deleted "${selectedTemplate}" template.`);
  };

  const handleAddNewQuestion = (sectionId: number) => {
    if (!newQuestionText.trim()) return;
    
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              questions: [...(section.questions || []), newQuestionText.trim()],
              questionCount: section.questionCount + 1
            }
          : section
      )
    );
    
    setNewQuestionText('');
    setShowNewQuestionModal(null);
  };

  const handleSaveEditedQuestion = () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === editingQuestion.sectionId
          ? {
              ...section,
              questions: section.questions?.map((q, idx) =>
                idx === editingQuestion.questionIndex ? editingQuestion.text.trim() : q
              )
            }
          : section
      )
    );
    
    setEditingQuestion(null);
  };

  const handleSaveEditedSection = () => {
    if (!editingSection || !editingSection.name.trim()) return;
    
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === editingSection.id
          ? { ...section, name: editingSection.name.trim() }
          : section
      )
    );
    
    setEditingSection(null);
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
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
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
                        {section.id === 1 && (
                          <div className="space-y-4">
                            <p>Hi {`{salutation_first_name}`}! Welcome to your online tax organizer. The information provided will allow us to complete your {`{questionnaire_year}`} tax return. Before you get started, please review the following:</p>
                            
                            <div className="space-y-3">
                              <div>
                                <strong>Engagement Letter:</strong> You'll start by being able to review and e-sign our engagement letter.
                              </div>
                              <div>
                                <strong>Tax Organizer:</strong> This is crucial as it helps us to meet our professional obligation to exercise due care, minimizes the likelihood of overlooking important details, and provides us with information that can aid in value-added tax planning.
                              </div>
                              <div>
                                <strong>Document Upload:</strong> You'll be prompted to upload relevant tax documents as you progress through the organizer as we recommend uploading all documents in this manner. If you do not have the document right now, click Upload Later, and we will remind you on the date specified. If you have already provided us with the information requested in the organizer (e.g. physical copy or through email), you can indicate that by clicking Provided Elsewhere.
                              </div>
                              <div>
                                <strong>Timeline:</strong> Please note that we may not start working on your tax preparation until all questions are answered and all requested documents are received. If you are not able to complete the organizer by {`{due_date}`} or if you have any question, please reach out to us through the chat icon on the top right.
                              </div>
                            </div>
                            
                            <p className="font-medium">Click Next to get started!</p>
                          </div>
                        )}
                        
                        {section.id === 2 && (
                          <div className="space-y-4">
                            <p>Dear {`{signer_names}`}:</p>
                            
                            <p>This letter is to confirm our understanding of the terms of our engagement and the nature and extent of the services we will provide. We will perform the following services for you: {`{firm_name}`} will review your federal and state income tax returns.</p>
                            
                            <p>We will not audit or otherwise verify the data you submit to us, although we may ask you to clarify certain items. We will review your prior year returns for an additional charge if requested.</p>
                            
                            <p>Our services are for the review, revision, or preparation of your tax returns. Our engagement should not be relied upon to disclose errors, fraud, or illegal acts. However, we will inform you of any such acts that come to our attention unless they are clearly inconsequential.</p>
                            
                            <p>The law imposes penalties when taxpayers underestimate their tax liability. Please call us if you have questions about the penalties that may apply to your specific circumstances.</p>
                            
                            <p>If we encounter instances of unclear tax law or of conflicting interpretations of the law, we will outline the reasonable courses of action and the risks and consequences of each. We will then follow the course you choose.</p>
                            
                            <p>Our fees are based on an hourly billing rate plus out-of-pocket expenses. Invoices are due upon presentation. We reserve the right to charge an interest rate of 1.5% per month on accounts that are unpaid within thirty (30) days.</p>
                            
                            <p>We will return your original records to you at the end of this engagement. You should securely store these records, along with all supporting documents, canceled checks, etc., as these items may later be needed to prove accuracy and completeness of a return to a taxing authority. We will retain copies of your records and our work papers for your engagement for seven years, after which these documents will be destroyed.</p>
                            
                            <p>This engagement concludes with the delivery of the analysis and recommendations. If you do not select e-filing, you are responsible for filing the returns with the appropriate taxing authorities. You should review all documents carefully before signing them.</p>
                            
                            <p>Please sign the enclosed copy of this letter in the space indicated below to acknowledge your receipt and understanding of its contents.</p>
                          </div>
                        )}
                        
                        {section.id === 3 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide the following information for any new business entities:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Entity name and type</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Date of incorporation/formation</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Federal Tax ID (EIN)</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">State of incorporation</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Business address and contact information</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 4 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide your basic contact and filing information:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Full legal name and any name changes during the tax year</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Current address and any address changes</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Social Security Number</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Filing status</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Number of dependents</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 5 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide the following financial documents:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">W-2 forms from all employers</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">1099 forms for interest, dividends, and other income</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Bank statements and investment account statements</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Mortgage interest statements (1098)</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Property tax statements</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 6 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please upload the following supporting documents:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Receipts for charitable contributions</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Medical expense receipts and insurance statements</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Business expense receipts and mileage logs</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Education expense documentation (1098-T)</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Retirement account contribution statements</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 7 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide information about tax payments made during the year:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Estimated tax payments made</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Extension payments</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Prior year refund applied to current year</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Withholding from wages and other income</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 8 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide state-specific information:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">State of residence</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">State income tax withholding</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">State estimated tax payments</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Multi-state income allocation (if applicable)</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 9 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please provide any additional information:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Life changes during the tax year (marriage, divorce, birth, death)</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Home purchase or sale</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Business start-up or closure</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Foreign bank accounts or assets</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {section.id === 10 && (
                          <div className="space-y-3">
                            <p className="font-semibold text-gray-900 mb-3">Please review all information provided and submit your completed questionnaire:</p>
                            <ul className="space-y-2">
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Verify all personal information is correct</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Confirm all required documents have been uploaded</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Review all answers for accuracy</span>
                              </li>
                              <li className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <span className="text-blue-700 font-semibold text-sm mt-0.5">•</span>
                                <span className="text-gray-800 text-sm flex-1">Submit the completed questionnaire</span>
                              </li>
                            </ul>
                          </div>
                        )}
                        
                        {![1,2,3,4,5,6,7,8,9,10].includes(section.id) && (
                          <p>Section content and questions would appear here...</p>
                        )}
                        
                        {/* Display AI-generated questions */}
                        {section.questions && section.questions.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="font-semibold text-gray-900 flex items-center">
                                <Sparkles size={16} className="mr-2 text-purple-600" />
                                AI-Generated Questions
                              </p>
                              <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                {section.questions.length} question{section.questions.length > 1 ? 's' : ''}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {section.questions.map((question, idx) => (
                                <li key={idx} className="group flex items-start space-x-2 p-3 bg-purple-50 rounded-lg border border-purple-200 hover:border-purple-300 transition-all">
                                  <span className="text-purple-700 font-semibold text-sm mt-0.5">{idx + 1}.</span>
                                  <span className="text-gray-800 text-sm flex-1">{question}</span>
                                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => navigator.clipboard.writeText(question)}
                                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                      title="Copy question"
                                    >
                                      <Copy size={14} />
                                    </button>
                                    <button
                                      onClick={() => setEditingQuestion({ sectionId: section.id, questionIndex: idx, text: question })}
                                      className="p-1.5 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                                      title="Edit question"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSections(prevSections =>
                                          prevSections.map(s =>
                                            s.id === section.id
                                              ? { ...s, questions: s.questions?.filter((_, i) => i !== idx), questionCount: Math.max(0, s.questionCount - 1) }
                                              : s
                                          )
                                        );
                                      }}
                                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                      title="Delete question"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Section Action Buttons */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setShowNewQuestionModal(section.id)}
                            className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors"
                            title="Add new question to this section"
                          >
                            <Plus size={16} className="mr-1" />
                            New Question
                          </button>
                          <button
                            onClick={() => setEditingSection({ id: section.id, name: section.name })}
                            className="flex items-center px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                            title="Edit section name and properties"
                          >
                            <Edit2 size={16} className="mr-1" />
                            Edit Section
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete the "${section.name}" section?`)) {
                                setSections(prevSections => prevSections.filter(s => s.id !== section.id));
                              }
                            }}
                            className="flex items-center px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
                            title="Delete this section"
                          >
                            <Trash2 size={16} className="mr-1" />
                            Delete Section
                          </button>
                        </div>
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
                <button 
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
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

                  {isGenerating && !showAiPanel && (
                    <div className="p-4 bg-purple-50 rounded-lg mb-4">
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

                  {aiResponse && !showAiPanel && !isGenerating && (
                    <div className="mb-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{aiResponse}</p>
                      </div>
                      <button
                        onClick={() => setAiResponse('')}
                        className="mt-2 text-xs text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                      >
                        <X size={14} />
                        <span>Clear response</span>
                      </button>
                    </div>
                  )}

                  {!aiResponse && !isGenerating && (
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
                  )}
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
                      <div className="relative bg-white rounded-lg border-2 border-gray-200 focus-within:border-purple-400 transition-all shadow-sm">
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
                          className="absolute bottom-2 right-2 p-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                          title="Send message (Enter)"
                        >
                          <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">Press Enter to send, Shift+Enter for new line</p>
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
                        {currentActionType === 'add-questions' ? 'Add Questions to Section' : 'Apply Suggestion'}
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

      {/* Create Template Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                  <Sparkles size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Create New Template</h2>
                  <p className="text-sm text-gray-600">AI-powered template generation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTemplateType('');
                  setNewTemplateDescription('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isCreatingTemplate}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Filing Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTemplateType}
                  onChange={(e) => setNewTemplateType(e.target.value)}
                  placeholder="e.g., 1040 Individual Return, Bookkeeping, S-Corporation, Partnership, Estate Tax..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isCreatingTemplate}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">
                  💡 Examples: "1040 Individual Tax Return", "Monthly Bookkeeping", "S-Corp Tax Filing", "Estate Tax Return"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Add any specific requirements or context... e.g., 'Include rental property information' or 'Focus on crypto trading activity'"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isCreatingTemplate}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Sparkles size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-2">How it works:</p>
                    <ul className="space-y-1.5 text-blue-800">
                      <li className="flex items-start">
                        <span className="mr-2">1.</span>
                        <span>Soraban AI researches the specific tax filing requirements</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">2.</span>
                        <span>Identifies necessary information sections and documents</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">3.</span>
                        <span>Generates a customized questionnaire template structure</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">4.</span>
                        <span>Each template is tailored to the specific filing type you specify</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {isCreatingTemplate && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Loader size={20} className="text-purple-600 animate-spin" />
                    <div className="text-sm text-purple-900">
                      <p className="font-medium">Creating your template...</p>
                      <p className="text-purple-700 mt-1">Researching requirements and generating sections (this may take 10-20 seconds)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewTemplateType('');
                  setNewTemplateDescription('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                disabled={isCreatingTemplate}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTemplate}
                disabled={!newTemplateType.trim() || isCreatingTemplate}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                {isCreatingTemplate ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Template</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <X size={24} className="text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delete Template</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete the <strong>"{selectedTemplate}"</strong> template?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <span className="text-red-600 font-bold">⚠️</span>
                  <div className="text-sm text-red-800">
                    <p className="font-medium mb-1">Warning:</p>
                    <ul className="space-y-1">
                      <li>• This will permanently delete the template</li>
                      <li>• All sections and questions will be removed</li>
                      <li>• This action cannot be undone</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTemplate}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center space-x-2"
              >
                <X size={18} />
                <span>Delete Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Question Modal */}
      {showNewQuestionModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add New Question</h2>
              <button
                onClick={() => {
                  setShowNewQuestionModal(null);
                  setNewQuestionText('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowNewQuestionModal(null);
                  setNewQuestionText('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddNewQuestion(showNewQuestionModal)}
                disabled={!newQuestionText.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Question</h2>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              <textarea
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                rows={4}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedQuestion}
                disabled={!editingQuestion.text.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Section</h2>
              <button
                onClick={() => setEditingSection(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section Name
              </label>
              <input
                type="text"
                value={editingSection.name}
                onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditedSection}
                disabled={!editingSection.name.trim()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionnaireTemplateBuilder;
