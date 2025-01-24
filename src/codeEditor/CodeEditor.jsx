import React from 'react'
import { useState } from 'react';
import Prism from 'prismjs';
import axios from 'axios';
import MonacoEditor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';
import { use } from 'react';
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.39.0/min/vs' } });
loader.init().then(() => {
    monaco.languages.register({ id: 'java' });
    monaco.languages.setMonarchTokensProvider('java', {
        keywords: [
            'abstract', 'continue', 'for', 'new', 'switch', 'assert', 'default', 'goto', 'package', 'synchronized',
            'boolean', 'do', 'if', 'private', 'this', 'break', 'double', 'implements', 'protected', 'throw',
            'byte', 'else', 'import', 'public', 'throws', 'case', 'enum', 'instanceof', 'return', 'transient',
            'catch', 'extends', 'int', 'short', 'try', 'char', 'final', 'interface', 'static', 'void',
            'class', 'finally', 'long', 'strictfp', 'volatile', 'const', 'float', 'native', 'super', 'while'
        ],
        operators: [
            '=', '>', '<', '!', '~', '?', ':', '==', '<=', '>=', '!=', '&&', '||', '++', '--', '+', '-', '*', '/', '&',
            '|', '^', '%', '<<', '>>', '>>>', '+=', '-=', '*=', '/=', '&=', '|=', '^=', '%=', '<<=', '>>=', '>>>='
        ],
        symbols: /[=><!~?:&|+\-*\/\^%]+/,

        tokenizer: {
            root: [
                [/[a-z_$][\w$]*/, {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }],
                [/[A-Z][\w\$]*/, 'type.identifier'], // Class names
                { include: '@whitespace' },
                [/[{}()\[\]]/, '@brackets'],
                [/@symbols/, {
                    cases: {
                        '@operators': 'operator',
                        '@default': ''
                    }
                }],
                [/\d*\.\d+([eE][\-+]?\d+)?[fFdD]?/, 'number.float'],
                [/0[xX][0-9a-fA-F]+[Ll]?/, 'number.hex'],
                [/\d+[lL]?/, 'number'],
                [/[;,.]/, 'delimiter'],
                [/"([^"\\]|\\.)*$/, 'string.invalid'], // Non-terminated string
                [/"/, 'string', '@string']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/\\./, 'string.escape'],
                [/"/, 'string', '@pop']
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\*/, 'comment', '@comment'],
                [/\/\/.*$/, 'comment']
            ],

            comment: [
                [/[^\/*]+/, 'comment'],
                [/\/\*/, 'comment', '@push'], // Nested comment
                [/\*\//, 'comment', '@pop'],
                [/[\/*]/, 'comment']
            ]
        }
    });
});
const CodeEditor = () => {
    let [code, setCode] = useState("");
    let [output, setOutput] = useState("");
    const [language, setLanguage] = useState("js");
    const [currentInput, setCurrentInput] = useState("");
    const [userInput, setUserInput] = useState([]);

    const handleCodeChange = (newCode) => {
        setCode(newCode);
    };

    const display = (outputResponse) => {
        console.log(outputResponse);
        const output = outputResponse.data.output;
        setOutput(output);
        console.log(output)
    }

    const runCode = async () => {
        const encoded = btoa(code);
        console.log(userInput);
        let input = JSON.stringify(userInput);
        console.log(JSON.parse(input))
        if (userInput.length != 0) {
            const response = axios.post("http://localhost:4000/execute", { language, encoded, userInput: input }).then((output) => { display(output) });
        } else {
            const response = axios.post("http://localhost:4000/execute", { language, encoded }).then((output) => { display(output) });
        }

    }

    const handleLanuageChange = (e) => {
        if (e.target.value == 'java') {
            setCode(atob("cGFja2FnZSBjb2RlOw0KcHVibGljIGNsYXNzIE1haW57DQogICAgcHVibGljIHN0YXRpYyB2b2lkIG1haW4oU3RyaW5nW10gYXJncyl7DQogICAgICAgIFN5c3RlbS5vdXQucHJpbnRsbigiSGkiKTsNCiAgICB9DQp9"))

        }
        setLanguage(e.target.value);
        console.log(language);

    }


    return (
        <div className='flex flex-col w-full h-screen gap-2 items-start'>
            <div className='flex flex-row items-center gap-x-1.5'>
                <button onClick={runCode} className='bg-amber-600 text-white w-16 text-lg p-2 rounded-md flex-1'>Run</button>
                <label className='text-white px-4' name="language">Choose the Language:</label>

                <select value={language} className=' flex-1 py-3 px-4 pe-9 block w-full bg-gray-100 border-transparent rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-700 dark:border-transparent dark:text-neutral-400 dark:focus:ring-neutral-600' onChange={handleLanuageChange} name="language" id="language">
                    <option value="java">Java</option>
                    <option value="js">Java Script</option>
                </select>

                <div className='flex-1 w-auto h-auto'>
                    <div className="w-full max-w-sm min-w-[200px]">
                        <input onChange={(e) => { setCurrentInput(e.target.value) }} value={currentInput} className="w-full bg-transparent placeholder:text-slate-400 text-white text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow" placeholder="Type here..." />
                    </div>
                </div>

                <button onClick={() => { if (currentInput) { userInput.push(currentInput) } }} className='bg-amber-600 text-white flex-2   p-2 rounded-md   '>Add Input</button>

                <button onClick={() => { if (currentInput) { } userInput.pop() }} className='bg-amber-600 text-white  flex-2  p-2 rounded-md '>Pop Input</button>
                <button onClick={() => { setOutput(userInput.toString()) }} className='bg-amber-600 text-white  flex-2  p-2 rounded-md '>Show Input</button>
            </div>
            {/* <div className='flex flex-row w-full h-screen gap-1'>

                <textarea placeholder='Start Typing Your Code....' type='text' className='flex-1 border-1 focus:outline-none border-gray-500 rounded-md  p-2 text-white text-left' value={code} onChange={(e) => { setCode(e.target.value) }} />


                <textarea type='text' className=' flex-1 border-1 focus:outline-none border-gray-500 rounded-md  p-2 text-white' value={output} onChange={(e) => { setOutput(e.target.value) }} />




            </div > */}

            <div className="flex flex-row w-full h-screen gap-1">
                {/* Monaco Editor for code input */}
                <MonacoEditor
                    language={(language == 'js' ? 'javascript' : 'java')}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    editorDidMount={(editor) => {
                        editor.focus(); // Focus the editor on load
                    }}
                    options={{
                        selectOnLineNumbers: true,
                        automaticLayout: true,
                        fontSize: 14,
                        wordWrap: 'on',
                    }}
                    className="flex-1"
                />

                {/* Monaco Editor for output */}
                <MonacoEditor
                    language="javascript"
                    theme="vs-dark"
                    value={output}
                    options={{
                        readOnly: true, // Make this editor read-only
                        fontSize: 14,
                        wordWrap: 'on',
                    }}
                    className="flex-1"
                />
            </div>

        </div>

    )
}


export default CodeEditor;