import { createRoot } from 'react-dom/client';
import Catalog from './Catalog';

let root;

export async function bootstrap() {}

export async function mount() {
  const container = document.getElementById('mf-container');
  root = createRoot(container);
  root.render(<Catalog />);
}

export async function unmount() {
  root.unmount();
}
