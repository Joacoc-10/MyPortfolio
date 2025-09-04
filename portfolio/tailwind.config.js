/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
				 "secondaryBackground": {
          100: '#2b2b32',
          200: '#232329',
          300: '#1c1c20',
          400: '#17171a',
          500: '#16161a', // base
          600: '#0d0d0f',
        },
        "whiteHeadline": {
          100: '#ffffff',
          200: '#fefefe',
          300: '#fdfdfd',
          400: '#fcfcfc',
          500: '#fffffe', // base
          600: '#e6e6e6',
        },
        "greyParagraph": {
          100: '#c8cfd8',
          200: '#b3bac4',
          300: '#9ea5b0',
          400: '#8990a0',
          500: '#94a1b2', // base
          600: '#7f8b98',
        },
        "purpleButton": {
          100: '#d9c4ff',
          200: '#c29bff',
          300: '#aa71f0',
          400: '#9147e0',
          500: '#7f5af0', // base
          600: '#693dcc',
        },
        "blackPrimary": {
          100: '#333333',
          200: '#262626',
          300: '#1a1a1a',
          400: '#0d0d0d',
          500: '#010101', // base
          600: '#000000',
        },
        "greySecondary": {
          100: '#b5b5ba',
          200: '#9e9ea4',
          300: '#87878e',
          400: '#707076',
          500: '#72757e', // base
          600: '#5b5d63',
        },
        "greenTertiary": {
          100: '#66d0a7',
          200: '#4fc68e',
          300: '#38bc74',
          400: '#21b05b',
          500: '#2cb67d', // base
          600: '#239a66',
        },
  		}
  	}
  },
  plugins: [("tailwindcss-animate")],
}

