import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const portal=fileURLToPath(new URL('../..',import.meta.url));
export default defineConfig({root,plugins:[react(),tailwindcss(),{
  name:'isolated-water-fixtures',enforce:'pre',
  resolveId(source){if(source.endsWith('/context/VendorContext'))return '\0preview-vendor';if(source.endsWith('/context/BusinessWorkspaceContext'))return '\0preview-workspace';},
  load(id){if(id==='\0preview-vendor')return `export {useVendor} from ${JSON.stringify(root.replaceAll('\\','/')+'state.tsx')}`;if(id==='\0preview-workspace')return `export {useBusinessWorkspace} from ${JSON.stringify(root.replaceAll('\\','/')+'state.tsx')}`;},
}],server:{host:'localhost',port:5194,strictPort:true,fs:{allow:[portal]}},cacheDir:portal+'/node_modules/.vite-water-preview'});
