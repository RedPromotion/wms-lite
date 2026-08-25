package com.wms.wms_lite.domain.board.entity;

import com.wms.wms_lite.domain.board.enums.PostCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "posts")
public class Post extends BaseArticle {

    

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PostCategory category = PostCategory.GENERAL;

    @Column(nullable = false)
    private boolean isSecret = false;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostComment> comments = new ArrayList<>();

    public static Post create(String title, String content, PostCategory category, boolean isSecret) {
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        post.setCategory(category != null ? category : PostCategory.GENERAL);
        post.setSecret(isSecret);
        return post;
    }

    public void addComment(PostComment comment) {
        this.comments.add(comment);
        comment.setPost(this);
    }

    public void update(String title, String content, PostCategory category, boolean isSecret) {
        setTitle(title);
        setContent(content);
        if (category != null) {
            this.category = category;
        }
        this.isSecret = isSecret;
    }
}
