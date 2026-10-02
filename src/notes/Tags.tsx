import type {Key} from "@heroui/react";

import {
  Avatar,
  Description,
  EmptyState,
  Tag,
  TagGroup,
  useListData,
} from "@heroui/react";

type TagGroupWithListDataProps = {
  isExpanded?: boolean;
  tagsList: {id: string, name: string}[]
};

export function TagGroupWithListData({
  tagsList,
  isExpanded = true,
}: TagGroupWithListDataProps) {
  type User = {
    id: string;
    name: string;
    avatar: string;
    fallback: string;
  };

  const list = useListData<User>({
    getKey: (item) => item.id,
    initialItems: [
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
        fallback: "F",
        id: "fred",
        name: "Fred",
      },
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/green.jpg",
        fallback: "M",
        id: "michael",
        name: "Michael",
      },
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/purple.jpg",
        fallback: "J",
        id: "jane",
        name: "Jane",
      },
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg",
        fallback: "A",
        id: "alice",
        name: "Alice",
      },
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/orange.jpg",
        fallback: "B",
        id: "bob",
        name: "Bob",
      },
      {
        avatar:
          "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/black.jpg",
        fallback: "C",
        id: "charlie",
        name: "Charlie",
      },
    ],
    initialSelectedKeys: new Set(["fred", "michael"]),
  });

  const onRemove = (keys: Set<Key>) => {
    list.remove(...keys);
  };

  return (
    <div>
      <TagGroup
        {...(isExpanded && {onRemove})}
        aria-label="Keywords"
        // selectedKeys={list.selectedKeys}
        // selectionMode="multiple"
        // onSelectionChange={(keys) => list.setSelectedKeys(keys)}
      >
        {isExpanded && (
          <Description>Tags are auto-generated</Description>
        )}

        <TagGroup.List
          items={tagsList}
          renderEmptyState={() => (
            <></>
          )}
        >
          {(item) => <Tag key={item.id}>{item.name}</Tag>}
        </TagGroup.List>
      </TagGroup>
    </div>
  );
}
