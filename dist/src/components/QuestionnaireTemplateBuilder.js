import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Settings, MessageSquare, Bell, User } from 'lucide-react';
const QuestionnaireTemplateBuilder = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('Entity Tax Filing');
    const [expandedSections, setExpandedSections] = useState({});
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
    const toggleSection = (id) => {
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("header", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex items-center", children: _jsx("span", { className: "text-xl font-semibold text-gray-900", children: "Soraban" }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded", children: _jsx(MessageSquare, { size: 20 }) }), _jsx("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded", children: _jsx(Bell, { size: 20 }) }), _jsxs("div", { className: "flex items-center space-x-2 cursor-pointer", children: [_jsx("div", { className: "w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center", children: _jsx(User, { size: 18, className: "text-white" }) }), _jsxs("div", { className: "text-sm", children: [_jsx("div", { className: "font-medium text-gray-900", children: "Alice Advisor" }), _jsx("div", { className: "text-gray-500", children: "Staff" })] }), _jsx(ChevronDown, { size: 16, className: "text-gray-400" })] })] })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-6 py-8", children: [_jsx("div", { className: "mb-6", children: _jsxs("button", { className: "flex items-center text-gray-600 hover:text-gray-900 mb-4", children: [_jsx("span", { className: "mr-2", children: "\u2190" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: "Questionnaire Templates" })] }) }), _jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsx("input", { type: "text", placeholder: "Search Templates", className: "px-4 py-2 border border-gray-300 rounded-lg w-96 focus:outline-none focus:ring-2 focus:ring-blue-500" }), _jsxs("button", { className: "flex items-center px-4 py-2 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50", children: [_jsx(Plus, { size: 18, className: "mr-2" }), "Create a template"] })] }), _jsx("div", { className: "flex space-x-2 mb-6", children: templates.map(template => (_jsx("button", { onClick: () => setSelectedTemplate(template), className: `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedTemplate === template
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`, children: template }, template))) }), _jsxs("div", { className: "bg-white rounded-lg shadow-sm border border-gray-200", children: [_jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex items-center justify-between", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: selectedTemplate }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("button", { className: "text-sm text-blue-600 hover:text-blue-700", children: "Send Me a Test" }), _jsx("button", { className: "text-sm text-blue-600 hover:text-blue-700", children: "Show Preview" }), _jsx("button", { className: "text-sm text-blue-600 hover:text-blue-700", children: "Create Template Link" }), _jsx("button", { className: "text-sm text-blue-600 hover:text-blue-700", children: "Edit Messages" }), _jsx("button", { className: "p-2 text-gray-600 hover:bg-gray-100 rounded", children: _jsx(Settings, { size: 18 }) })] })] }), _jsxs("div", { className: "px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "font-medium text-gray-900", children: "Sections" }), _jsx("div", { className: "w-5 h-5 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs", children: "i" })] }), _jsx("button", { onClick: () => setExpandedSections({}), className: "text-gray-600 hover:text-gray-900", children: _jsx(ChevronUp, { size: 18 }) })] }), _jsx("div", { className: "divide-y divide-gray-200", children: sections.map(section => (_jsxs("div", { className: "px-6 py-4", children: [_jsxs("button", { onClick: () => toggleSection(section.id), className: "w-full flex items-center justify-between text-left hover:bg-gray-50 -mx-6 px-6 py-2 rounded", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsxs("div", { className: "flex flex-col space-y-0.5", children: [_jsx("div", { className: "w-4 h-0.5 bg-gray-400" }), _jsx("div", { className: "w-4 h-0.5 bg-gray-400" }), _jsx("div", { className: "w-4 h-0.5 bg-gray-400" })] }), _jsx("span", { className: "font-medium text-gray-900", children: section.name }), section.questionCount > 0 && (_jsx("span", { className: "px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full", children: section.questionCount }))] }), _jsx(ChevronDown, { size: 18, className: `text-gray-400 transition-transform ${expandedSections[section.id] ? 'transform rotate-180' : ''}` })] }), expandedSections[section.id] && (_jsx("div", { className: "mt-4 ml-7 p-4 bg-gray-50 rounded text-sm text-gray-600", children: "Section content and questions would appear here..." }))] }, section.id))) }), _jsx("div", { className: "px-6 py-6 border-t border-gray-200 flex justify-center", children: _jsxs("button", { onClick: addSection, className: "flex items-center px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg", children: [_jsx(Plus, { size: 18, className: "mr-2" }), "Add Section"] }) }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex items-center space-x-3", children: [_jsx("button", { className: "px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50", children: "Export Template" }), _jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Duplicate Template" }), _jsx("button", { className: "px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50", children: "Delete Template" })] })] }), _jsxs("div", { className: "mt-8 text-center text-sm text-gray-500 space-x-4", children: [_jsx("a", { href: "#", className: "hover:text-gray-700", children: "Terms of Service" }), _jsx("a", { href: "#", className: "hover:text-gray-700", children: "Privacy Policy" }), _jsx("a", { href: "#", className: "hover:text-gray-700", children: "Help" })] })] }), _jsxs("button", { className: "fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-800 flex items-center space-x-2", children: [_jsx("div", { className: "w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center", children: _jsx(MessageSquare, { size: 16 }) }), _jsx("span", { children: "Ask me anything..." })] })] }));
};
export default QuestionnaireTemplateBuilder;
//# sourceMappingURL=QuestionnaireTemplateBuilder.js.map