import type { Keyword, Reward } from "@/types/nlp";
import type {Key} from "@heroui/react";

import {
  Description,
  Tag,
  TagGroup,
} from "@heroui/react";
import type React from "react";

type TagGroupWithListDataProps = {
  isExpanded?: boolean;
  rewardKeyword: ({samplerId, dislike}: Reward) => void;
  tagsList: Keyword[]
  setKw: React.Dispatch<React.SetStateAction<Keyword[]>>;
};

export function TagGroupWithListData({
  tagsList,
  setKw,
  rewardKeyword = (()=>{}),
  isExpanded = true,
}: TagGroupWithListDataProps) {

  
  const onRemove = (keys: Set<Key>) => {
  console.log("SS");

  const dislikedKeywords = tagsList.filter((keyword) =>
    keys.has(keyword.id)
  );

  console.log(dislikedKeywords)

  dislikedKeywords.forEach((keyword: Keyword) => {
    rewardKeyword({
      samplerId: keyword.sampler,
      dislike: 1,
    });
  });

  setKw((currentKw) =>
    currentKw.filter((tag) => !keys.has(tag.id))
  );
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
