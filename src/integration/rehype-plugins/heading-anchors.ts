/**
 * Rehype plugin that adds anchor links to headings.
 * Transforms headings (h2-h6) to include a clickable "#" link
 * that copies the anchor URL to clipboard on click.
 */

import type { Root, Element } from 'hast';
import { visit } from 'unist-util-visit';

export interface RehypeHeadingAnchorsOptions {
  behavior?: 'wrap' | 'prepend' | 'append';
  properties?: Record<string, string>;
}

export default function rehypeHeadingAnchors(options: RehypeHeadingAnchorsOptions = {}) {
  const { behavior = 'prepend' } = options;

  return (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if (!['h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName)) return;

      const id = node.properties?.id;
      if (!id || typeof id !== 'string') return;

      const anchorLink: Element = {
        type: 'element',
        tagName: 'a',
        properties: {
          href: `#${id}`,
          className: ['docsy-heading-anchor'],
          'aria-label': `Link to ${getTextContent(node)}`,
        },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: ['docsy-heading-anchor-icon'] },
            children: [{ type: 'text', value: '#' }],
          },
        ],
      };

      if (behavior === 'wrap') {
        const children = [...node.children];
        node.children = [{
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['docsy-heading-anchor'],
          },
          children,
        }];
      } else if (behavior === 'append') {
        node.children.push(anchorLink);
      } else {
        node.children.unshift(anchorLink);
      }
    });
  };
}

function getTextContent(node: Element): string {
  let text = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      text += child.value;
    } else if ('children' in child) {
      text += getTextContent(child as Element);
    }
  }
  return text;
}
