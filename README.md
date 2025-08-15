ElevenRifas — Plataforma de rifas digitales (Next.js + shadcn/ui + Supabase)

## Getting Started

1) Copia `.env.example` a `.env.local` y completa las variables de Supabase
2) Instala dependencias: `npm install`
3) Ejecuta el servidor de desarrollo:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Abre [http://localhost:3000](http://localhost:3000) para ver la app.

Puntos clave:
- App Router (`app/`), TypeScript, Tailwind v4
- shadcn/ui (estilo New York, base zinc)
- Tema luxury: negro (#000000) y rojo (#FF0000)
- Carpeta `admin/` con dashboard, rifas, usuarios, pagos

Estructura:
- `app/`: páginas públicas y dinámicas
- `admin/`: administración (dashboard, rifas, usuarios, pagos)
- `components/`: UI reusable y componentes de dominio
- `lib/`: utilidades, validaciones, cliente Supabase
- `types/`: tipos globales

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
