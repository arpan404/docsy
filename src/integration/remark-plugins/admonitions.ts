/**
 * Remark plugin that transforms GitHub-style blockquote admonitions
 * into structured callout components.
 *
 * Transforms:
 *   > [!NOTE]
 *   > This is a note
 *
 * Into the equivalent of:
 *   <Callout type="note">This is a note</Callout>
 *
 * Supported types: NOTE, TIP, WARNING, IMPORTANT, CAUTION
 */

import type { Root, Blockquote, Paragraph, Text } from 'mdast';
import { visit } from 'unist-util-visit';

const ADMONITION_TYPES: Record<string, string> = {
  NOTE: 'note',
  TIP: 'tip',
  WARNING: 'warning',
  IMPORTANT: 'info',
  CAUTION: 'danger',
};

const ADMONITION_RE = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i;

export default function remarkAdmonitions() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote, index, parent) => {
      if (!parent || index === undefined) return;

      const firstChild = node.children[0];
      if (!firstChild || firstChild.type !== 'paragraph') return;

      const firstInline = firstChild.children[0];
      if (!firstInline || firstInline.type !== 'text') return;

      const match = firstInline.value.match(ADMONITION_RE);
      if (!match) return;

      const typeKey = match[1].toUpperCase();
      const calloutType = ADMONITION_TYPES[typeKey];
      if (!calloutType) return;

      // Remove the admonition tag from the text
      const remainingText = firstInline.value.slice(match[0].length);
      if (remainingText) {
        (firstInline as Text).value = remainingText;
      } else {
        firstChild.children.shift();
        // If the paragraph is now empty, remove it
        if (firstChild.children.length === 0) {
          node.children.shift();
        }
      }

      // Transform the blockquote into an MDX JSX element (callout)
      const calloutNode: any = {
        type: 'mdxJsxFlowElement',
        name: 'Callout',
        attributes: [
          {
            type: 'mdxJsxAttribute',
            name: 'type',
            value: calloutType,
          },
        ],
        children: node.children,
        data: { _mdxExplicitJsx: true },
      };

      parent.children[index] = calloutNode;
    });
  };
}
