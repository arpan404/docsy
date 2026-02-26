export default function remarkMermaid() {
  return (tree) => {
    transform(tree);
  };
}

function transform(node) {
  if (!node || !Array.isArray(node.children)) return;

  for (let i = 0; i < node.children.length; i += 1) {
    const child = node.children[i];

    if (child?.type === 'code' && child.lang === 'mermaid') {
      node.children[i] = {
        type: 'mdxJsxFlowElement',
        name: 'Mermaid',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'chart',
            value: child.value || '',
          },
        ],
        children: [],
        data: { _mdxExplicitJsx: true },
      };
      continue;
    }

    transform(child);
  }
}
