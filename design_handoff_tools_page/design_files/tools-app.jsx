// BuilderStack — Tools page app shell (chat-scoped)
const { useState: useToolsState } = React;

function getChatId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('chat') || 'crm';   // default to CRM example
}

function ToolsApp() {
  const [openTool, setOpenTool] = useToolsState(null);
  const data = window.TOOLS_DATA;
  const chatsCtx = window.CHATS_CTX;

  const chatId = getChatId();
  const ctx = chatsCtx[chatId] || chatsCtx.crm;
  const category = data.categories.find(c => c.id === ctx.categoryId) || data.categories[0];
  const chat = { ...ctx, categoryTitle: category.title };

  return (
    <div className="tools-page">
      <ToolsNav category={category} />
      <ToolsHero chat={chat} />
      <CategorySection
        category={category}
        onOpen={(tool, category) => setOpenTool({ tool, category })}
      />
      <CompareCTA />
      <DisclosureFooter />

      {openTool && (
        <ToolDrawer
          tool={openTool.tool}
          category={openTool.category}
          chat={chat}
          onClose={() => setOpenTool(null)}
        />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('tools-root')).render(<ToolsApp />);
