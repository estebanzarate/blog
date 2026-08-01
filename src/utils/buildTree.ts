import type { CollectionEntry } from "astro:content";

export interface TreeNode {
    name: string;
    path: string;
    post?: CollectionEntry<"post">;
    children: TreeNode[];
}

export function buildTree(posts: CollectionEntry<"post">[]): TreeNode[] {
    const root: TreeNode[] = [];

    for (const post of posts) {
        const segments = post.id.split("/");
        let currentLevel = root;
        let accumulatedPath = "";

        segments.forEach((segment, index) => {
            accumulatedPath = accumulatedPath ? `${accumulatedPath}/${segment}` : segment;
            const isLastSegment = index === segments.length - 1;

            let node = currentLevel.find((n) => n.name === segment);

            if (!node) {
                node = { name: segment, path: accumulatedPath, children: [] };
                currentLevel.push(node);
            }

            if (isLastSegment) {
                node.post = post;
            }

            currentLevel = node.children;
        });
    }

    return root;
}