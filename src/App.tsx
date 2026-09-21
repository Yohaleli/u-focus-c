import { FormEvent, useMemo, useState } from 'react';
import { Bell, ChevronRight, Compass, Film, History, Home, Menu, Mic, MoreVertical, Music2, Play, Search, ShoppingBag, Tv, UserRound, Video, Youtube, Zap } from 'lucide-react';

type VideoItem = { title: string; channel: string; meta: string; duration: string; image: string; avatar: string; category: string };

const videos: VideoItem[] = [
  { title: 'A quiet morning in the mountains — cinematic escape', channel: 'Field Notes', meta: '2.4M views • 3 weeks ago', duration: '12:48', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=85', avatar: 'FN', category: 'Travel' },
  { title: 'The perfect homemade pasta, explained simply', channel: 'The Good Kitchen', meta: '842K views • 6 days ago', duration: '18:21', image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=900&q=85', avatar: 'GK', category: 'Cooking' },
  { title: 'Designing a calmer, more focused workspace', channel: 'Form & Function', meta: '316K views • 2 weeks ago', duration: '9:14', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=85', avatar: 'F&', category: 'Design' },
  { title: 'Night drive radio — synthwave mix for late hours', channel: 'Afterdark FM', meta: '5.1M views • 1 month ago', duration: '1:02:36', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=85', avatar: 'AF', category: 'Music' },
  { title: 'A beginner’s guide to street photography', channel: 'Grain Studio', meta: '1.1M views • 8 days ago', duration: '22:05', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85', avatar: 'GS', category: 'Photography' },
  { title: 'What happens inside a modern electric car?', channel: 'Future Motion', meta: '678K views • 4 days ago', duration: '14:32', image: 'https://images.unsplash.com/photo-1592833159155-c62df1b65634?auto=format&fit=crop&w=900&q=85', avatar: 'FM', category: 'Technology' },
  { title: 'Tokyo after rain: a slow walk through the city', channel: 'Roam Slowly', meta: '924K views • 11 days ago', duration: '36:17', image: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=900&q=85', avatar: 'RS', category: 'Travel' },
  { title: 'Building a tiny cabin from start to finish', channel: 'Made Outside', meta: '3.7M views • 2 months ago', duration: '28:46', image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=900&q=85', avatar: 'MO', category: 'Lifestyle' },
];

const primaryNav = [{ label: 'Home', icon: Home }, { label: 'Shorts', icon: Zap }, { label: 'Subscriptions', icon: Video }];
const libraryNav = [{ label: 'You', icon: UserRound }, { label: 'History', icon: History }];
const exploreNav = [{ label: 'Shopping', icon: ShoppingBag }, { label: 'Music', icon: Music2 }, { label: 'Movies & TV', icon: Film }];
const moreNav = [{ label: 'YouTube Premium', icon: Youtube }, { label: 'YouTube TV', icon: Tv }, { label: 'YouTube Music', icon: Music2 }, { label: 'YouTube Kids', icon: Youtube }];
const filters = ['All', 'Music', 'Mixes', 'Design', 'Cooking', 'Travel', 'Technology', 'Photography', 'Lifestyle'];

function YouTubeLogo() {
  return <button className="brand" aria-label="YouTube home"><span className="brand-mark"><Play size={15} fill="white" strokeWidth={0} /></span><span className="brand-name">YouTube</span><sup>US</sup></button>;
}

function NavGroup({ items, active, onSelect }: { items: typeof primaryNav; active: string; onSelect: (label: string) => void }) {
  return <div className="nav-group">{items.map(({ label, icon: Icon }) => <button className={`nav-item ${active === label ? 'active' : ''}`} key={label} onClick={() => onSelect(label)}><Icon size={21} strokeWidth={active === label ? 2.4 : 1.8} /><span>{label}</span></button>)}</div>;
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState('Home');
  const [activeFilter, setActiveFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [notice, setNotice] = useState('');

  const filteredVideos = useMemo(() => videos.filter((video) => {
    const matchesFilter = activeFilter === 'All' || video.category === activeFilter || (activeFilter === 'Mixes' && video.category === 'Music');
    return matchesFilter && `${video.title} ${video.channel} ${video.category}`.toLowerCase().includes(searchTerm.toLowerCase());
  }), [activeFilter, searchTerm]);

  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2600); };
  const handleSearch = (event: FormEvent) => { event.preventDefault(); setSearchTerm(query.trim()); };
  const chooseNav = (label: string) => { setActiveNav(label); if (label !== 'Home') showNotice(`${label} is ready to explore`); };

  return <div className={`app-shell ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
    <header className="topbar">
      <div className="topbar-left"><button className="icon-button" aria-label="Toggle navigation" onClick={() => setSidebarOpen((value) => !value)}><Menu size={24} /></button><YouTubeLogo /></div>
      <form className="search-wrap" onSubmit={handleSearch}>
        <div className="search-box"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" aria-label="Search" />{query && <button className="clear-search" type="button" onClick={() => { setQuery(''); setSearchTerm(''); }}>×</button>}<button className="search-button" type="submit" aria-label="Submit search"><Search size={21} /></button></div>
        <button className="voice-button" type="button" aria-label="Search with your voice" onClick={() => showNotice('Voice search is ready')}><Mic size={20} /></button>
      </form>
      <div className="topbar-actions"><button className="icon-button desktop-action" aria-label="Notifications" onClick={() => showNotice('Sign in to see notifications')}><Bell size={21} /></button><button className="sign-in-button" onClick={() => showNotice('Sign in flow opened')}><UserRound size={18} /> Sign in</button></div>
    </header>

    <aside className="sidebar">
      <NavGroup items={primaryNav} active={activeNav} onSelect={chooseNav} /><NavGroup items={libraryNav} active={activeNav} onSelect={chooseNav} />
      <div className="sidebar-signin"><p>Sign in to like videos, comment, and subscribe.</p><button className="sign-in-button" onClick={() => showNotice('Sign in flow opened')}><UserRound size={18} /> Sign in</button></div>
      <section className="sidebar-section"><h2>Explore</h2><NavGroup items={exploreNav} active={activeNav} onSelect={chooseNav} /></section>
      <section className="sidebar-section"><h2>More from YouTube</h2><NavGroup items={moreNav} active={activeNav} onSelect={chooseNav} /></section>
      <footer className="sidebar-footer"><p>About Press Copyright<br />Contact us Creators Advertise</p><p>Terms Privacy Policy & Safety<br />How YouTube works</p><span>© 2026 YouTube</span></footer>
    </aside>

    <main className="content">
      <div className="filter-row" role="toolbar" aria-label="Video categories">{filters.map((filter) => <button key={filter} className={activeFilter === filter ? 'selected' : ''} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div>
      <section className="welcome-panel">
        <div className="welcome-player" aria-hidden="true"><div className="player-glow player-glow-one" /><div className="player-glow player-glow-two" /><button className="hero-play" tabIndex={-1}><Play size={23} fill="white" strokeWidth={0} /></button><div className="player-controls"><span className="mini-play"><Play size={12} fill="white" /></span><div className="player-track"><span /></div><span>0:00</span><span className="control-spacer" /><span>HD</span><span className="fullscreen-icon" /></div></div>
        <div className="welcome-copy"><span className="eyebrow"><Compass size={16} /> YOUR NEXT WATCH STARTS HERE</span><h1>Find something worth watching.</h1><p>Search for a topic you love or start exploring recommendations picked for every kind of mood.</p><div className="welcome-actions"><button className="primary-action" onClick={() => document.querySelector<HTMLInputElement>('.search-box input')?.focus()}><Search size={18} /> Start searching</button><button className="secondary-action" onClick={() => document.querySelector('.recommendations')?.scrollIntoView({ behavior: 'smooth' })}>Browse videos <ChevronRight size={18} /></button></div></div>
      </section>

      <section className="recommendations">
        <div className="section-heading"><div><h2>{searchTerm ? `Results for “${searchTerm}”` : 'Recommended for you'}</h2><p>{searchTerm ? `${filteredVideos.length} videos found` : 'A fresh mix to help you get started'}</p></div>{searchTerm && <button onClick={() => { setQuery(''); setSearchTerm(''); }}>Clear search</button>}</div>
        {filteredVideos.length ? <div className="video-grid">{filteredVideos.map((video) => <article className="video-card" key={video.title} tabIndex={0} aria-label={`Play ${video.title}`} onClick={() => showNotice(`Now playing: ${video.title}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showNotice(`Now playing: ${video.title}`); } }}><div className="thumbnail"><img src={video.image} alt="" /><span className="duration">{video.duration}</span><div className="thumbnail-play"><Play size={19} fill="white" strokeWidth={0} /></div></div><div className="video-info"><div className="avatar">{video.avatar}</div><div className="video-copy"><h3>{video.title}</h3><p>{video.channel} <span className="verified">✓</span></p><p>{video.meta}</p></div><button className="more-button" aria-label={`More options for ${video.title}`} onClick={(event) => { event.stopPropagation(); showNotice('More options'); }}><MoreVertical size={20} /></button></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Search size={30} /></div><h3>No videos found</h3><p>Try another search or choose a different topic.</p><button onClick={() => { setQuery(''); setSearchTerm(''); setActiveFilter('All'); }}>Show all videos</button></div>}
      </section>
    </main>
    {notice && <div className="toast" role="status">{notice}</div>}
  </div>;
}
