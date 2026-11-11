FROM mcr.microsoft.com/playwright:v1.49.1-noble

ENV NODE_ENV=production \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY index.js alloha-session.js wrapper.js ./

USER pwuser
CMD ["node", "index.js"]

