export function registerPortfolioTools(projects, selectProject) {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const lifecycle = new AbortController();
  const tools = [
    {
      name: 'find_portfolio_projects', title: '포트폴리오 프로젝트 찾기',
      description: 'Search the portfolio by name, category, or technology and return matching projects and their actual destination links. Does not navigate.',
      inputSchema: { type: 'object', properties: { query: { type: 'string', maxLength: 200 } }, required: ['query'], additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || typeof input.query !== 'string' || input.query.length > 200 || Object.keys(input).some((key) => key !== 'query')) throw new Error('A query string of up to 200 characters is required.');
        const query = input.query.trim().toLocaleLowerCase();
        return projects.filter((p) => `${p.title} ${p.category} ${p.tags.join(' ')}`.toLocaleLowerCase().includes(query))
          .map((p) => ({ id: p.id, title: p.title, category: p.category, url: p.url }));
      },
    },
    {
      name: 'select_portfolio_project', title: '프로젝트 소개 열기',
      description: 'Select an existing project and show its description in this portfolio. Does not open external sites.',
      inputSchema: { type: 'object', properties: { id: { type: 'string', enum: projects.map((p) => p.id) } }, required: ['id'], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!input || typeof input !== 'object' || typeof input.id !== 'string' || Object.keys(input).some((key) => key !== 'id')) throw new Error('A project id is required.');
        const project = projects.find((p) => p.id === input.id);
        if (!project) throw new Error('Unknown project.');
        selectProject(project.id);
        return { id: project.id, title: project.title, url: project.url };
      },
    },
  ];
  for (const tool of tools) {
    try { void Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); }
    catch { /* Unsupported experimental API must never block the portfolio. */ }
  }
  window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
}
