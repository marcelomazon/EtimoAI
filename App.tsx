
import React, { useState, useEffect } from 'react';
import { Search, Info, BookOpen, AlertCircle, RefreshCw, GraduationCap, Clock, Trash2 } from 'lucide-react';
import { getEtymologyData } from './services/geminiService';
import { EtymologyInfo, AppStatus } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('aluno');
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<EtymologyInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  // Load history on mount
  useEffect(() => {
    const stored = localStorage.getItem('etimo_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const addToHistory = (word: string) => {
    setHistory(prev => {
      const filtered = prev.filter(w => w.toLowerCase() !== word.toLowerCase());
      const newHistory = [word, ...filtered].slice(0, 10);
      localStorage.setItem('etimo_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('etimo_history');
  };

  const handleSearch = async (e?: React.FormEvent, overrideWord?: string) => {
    if (e) e.preventDefault();
    const wordToSearch = overrideWord || query;
    if (!wordToSearch.trim()) return;

    setQuery(wordToSearch);
    setStatus(AppStatus.LOADING);
    setError(null);

    try {
      const data = await getEtymologyData(wordToSearch);
      setResult(data);
      setStatus(AppStatus.SUCCESS);
      addToHistory(wordToSearch);
    } catch (err) {
      setError("Não foi possível buscar a etimologia agora. Tente novamente em instantes.");
      setStatus(AppStatus.ERROR);
    }
  };

  // Initial load for "aluno"
  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              EtimoAI
            </h1>
          </div>
          <div className="hidden sm:block text-slate-500 text-sm italic">
            "A verdade por trás de cada sílaba"
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Search Section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4 sm:text-4xl tracking-tight">
            Descubra a <span className="text-indigo-600">verdadeira</span> origem.
          </h2>
          
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-6">
            <div className="relative group">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: aluno, saudade, salário..."
                className="w-full pl-12 pr-32 py-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all outline-none text-lg shadow-sm group-hover:border-slate-300"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <button
                type="submit"
                disabled={status === AppStatus.LOADING}
                className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {status === AppStatus.LOADING ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : 'Explorar'}
              </button>
            </div>
          </form>

          {/* Quick History for Mobile/Small Screens */}
          {history.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto lg:hidden">
              <span className="text-xs text-slate-400 w-full mb-1">Buscas recentes:</span>
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(undefined, item)}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-sm transition-colors flex items-center gap-1"
                >
                  <Clock className="w-3 h-3" /> {item}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Content Section with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {status === AppStatus.ERROR && (
              <div className="bg-red-50 border border-red-200 p-6 rounded-2xl flex items-start gap-4 animate-in fade-in duration-300">
                <AlertCircle className="text-red-600 w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">Oops! Algo deu errado.</h3>
                  <p className="text-red-700">{error}</p>
                  <button 
                    onClick={() => handleSearch()} 
                    className="mt-4 text-sm font-semibold text-red-800 hover:underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            )}

            {status === AppStatus.SUCCESS && result && (
              <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8">
                {/* Main Card */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                  <div className="p-8 sm:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                      <div>
                        <span className="text-indigo-600 font-bold text-sm tracking-widest uppercase">Etimologia de</span>
                        <h3 className="text-5xl font-serif font-bold text-slate-900 mt-2 capitalize">{result.word}</h3>
                      </div>
                      <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-200 self-start">
                        <span className="text-slate-500 text-sm">Raiz: </span>
                        <span className="text-slate-800 font-medium">{result.origin}</span>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        {result.myth && (
                          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-2xl">
                            <div className="flex items-center gap-2 text-amber-800 font-bold mb-2">
                              <GraduationCap className="w-5 h-5" />
                              <span>O Mito Comum</span>
                            </div>
                            <p className="text-amber-900 leading-relaxed italic">
                              "{result.myth}"
                            </p>
                          </div>
                        )}

                        <div>
                          <h4 className="flex items-center gap-2 text-slate-900 font-bold text-xl mb-4">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full"></div>
                            A Origem Real
                          </h4>
                          <p className="text-slate-700 text-lg leading-relaxed font-serif">
                            {result.truth}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                          <h4 className="text-indigo-900 font-bold mb-3 flex items-center gap-2">
                            <Info className="w-5 h-5" /> Evolução e Contexto
                          </h4>
                          <p className="text-indigo-800 leading-relaxed text-sm italic">
                            {result.context}
                          </p>
                        </div>

                        {result.funFact && (
                          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                            <h4 className="text-emerald-900 font-bold mb-2">Você sabia?</h4>
                            <p className="text-emerald-800 text-sm leading-relaxed">
                              {result.funFact}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Special focus for the "aluno" query */}
                {result.word.toLowerCase() === 'aluno' && (
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl text-white shadow-lg">
                    <h4 className="text-2xl font-bold mb-4 flex items-center gap-3">
                      <GraduationCap className="w-8 h-8" /> 
                      Conclusão sobre "Aluno"
                    </h4>
                    <p className="text-indigo-50 text-lg leading-relaxed mb-6">
                      A palavra <strong>aluno</strong> NÃO significa "sem luz". 
                      Essa é uma falsa etimologia. A verdadeira raiz vem do latim <em>alumnus</em>, que deriva de <em>alere</em> ("alimentar", "nutrir").
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full text-sm">
                        ❌ a (sem) + lumen (luz)
                      </div>
                      <div className="bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-bold border border-white/30">
                        ✅ alere (nutrir/alimentar)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {status === AppStatus.IDLE && (
              <div className="text-center py-20 opacity-40">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p>Pronto para mergulhar no passado das palavras?</p>
              </div>
            )}
          </div>

          {/* Sidebar Area (Desktop) */}
          <aside className="hidden lg:block space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-24 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  Histórico
                </h4>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    title="Limpar histórico"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p>Nenhuma pesquisa recente.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {history.map((item, idx) => (
                    <li key={idx}>
                      <button
                        onClick={() => handleSearch(undefined, item)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 group border border-transparent hover:border-indigo-100 hover:bg-indigo-50 ${query === item ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-medium' : 'text-slate-600'}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-indigo-400 shrink-0"></span>
                        <span className="truncate capitalize">{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h5 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">Dica EtimoAI</h5>
                  <p className="text-xs text-indigo-700 leading-relaxed">
                    Sabia que "Saudade" é uma das palavras mais difíceis de traduzir no mundo? Experimente buscá-la!
                  </p>
                </div>
              </div>
            </div>
          </aside>

        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-1 rounded">
                <BookOpen className="text-white w-4 h-4" />
              </div>
              <span className="text-white font-bold">EtimoAI</span>
            </div>
            <div className="text-sm">
              Criado para entusiastas da língua e curiosos em geral. Powered by Gemini.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Dicionário</a>
              <a href="#" className="hover:text-white transition-colors">Sobre</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500 italic">
            "A linguagem é o roteiro de uma cultura. Ele diz de onde vem o seu povo e para onde ele está indo." — Rita Mae Brown
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
