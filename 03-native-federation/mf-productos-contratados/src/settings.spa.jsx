import { createRoot } from 'react-dom/client';
import Settings from './Settings';

let root;

export async function bootstrap() {}

export async function mount() {
  const container = document.getElementById('mf-container');
  root = createRoot(container);
  root.render(<Settings />);
}

export async function unmount() {
  root.unmount();
}
