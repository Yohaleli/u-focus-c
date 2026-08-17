import re

with open('src/App.tsx', 'r') as f:
    text = f.read()

to_replace = """                  <SessionStats logs={sessionLogs} userId={currentUser?.uid || null} />
                </div>"""

replacement = """                  <SessionStats logs={sessionLogs} userId={currentUser?.uid || null} />
                  
                  {/* Soundscape Section */}
                  <div className="bg-white/5 border border-white/20 rounded-3xl p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-serif text-white flex items-center gap-2">
                        <Music className="w-5 h-5 text-white/60" /> Soundscape
                      </h2>
                      <div className="flex bg-white/5 rounded-lg p-1">
                        <button
                          onClick={() => setAudioSourceType('spotify')}
                          className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${audioSourceType === 'spotify' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Spotify
                        </button>
                        <button
                          onClick={() => setAudioSourceType('local')}
                          className={`px-3 py-1 text-xs font-mono uppercase tracking-wider rounded-md transition-colors ${audioSourceType === 'local' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                        >
                          Local
                        </button>
                      </div>
                    </div>

                    {audioSourceType === 'spotify' && (
                      <div className="space-y-4 animate-fade-in">
                        {isEditingSpotify ? (
                          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-xl">
                            <input
                              type="text"
                              value={tempSpotifyUrl}
                              onChange={(e) => setTempSpotifyUrl(e.target.value)}
                              placeholder="Paste Spotify embed URL..."
                              className="flex-1 bg-transparent border-none outline-none text-sm text-white px-2 font-mono"
                            />
                            <button
                              onClick={() => {
                                setSpotifyUrl(formatSpotifyUrl(tempSpotifyUrl));
                                setIsEditingSpotify(false);
                              }}
                              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setIsEditingSpotify(false)}
                              className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative group rounded-xl overflow-hidden bg-black/40">
                            <iframe 
                              className="w-full h-[152px] border-0" 
                              src={formatSpotifyUrl(spotifyUrl)} 
                              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                              loading="lazy" 
                            />
                            <button
                              onClick={() => {
                                setTempSpotifyUrl(spotifyUrl);
                                setIsEditingSpotify(true);
                              }}
                              className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-black backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xl border border-white/10 cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {audioSourceType === 'local' && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 animate-fade-in">
                        {localAudioUrl ? (
                          <LocalAudioPlayer url={localAudioUrl} name={localAudioName || 'Local Audio'} />
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 px-4 text-center border-2 border-dashed border-white/10 rounded-xl">
                            <Music className="w-8 h-8 text-white/20 mb-3" />
                            <p className="text-white/60 mb-4 text-sm">Select an audio file from your device</p>
                            <label className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-neutral-200 transition-colors cursor-pointer flex items-center gap-2">
                              <FolderOpen className="w-4 h-4" /> Choose File
                              <input
                                type="file"
                                accept="audio/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = URL.createObjectURL(file);
                                    setLocalAudioUrl(url);
                                    setLocalAudioName(file.name);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>"""

text = text.replace(to_replace, replacement)

with open('src/App.tsx', 'w') as f:
    f.write(text)

