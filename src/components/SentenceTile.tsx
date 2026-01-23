import './Components.css'

interface TileProps {
  word: string;
  onClick: () => void;
  status?: 'default' | 'correct' | 'wrong' | 'disabled';
}

export const SentenceTile = ({ word, onClick, status = 'default' }: TileProps) => (
  <button onClick={onClick} className={`tile tile-${status}`}>
    {word}
  </button>
);