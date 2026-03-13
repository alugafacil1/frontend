"use client";

import { postService } from "@/services/testeService/testeService";
import { Iteste } from "@/types/teste.types";
import { useEffect, useState } from "react";

export default function PostsFeature() {
    const [posts, setPosts] = useState<Iteste[]>([]);

    useEffect(() => {
        postService.getAll().then(setPosts);
    }, []);

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold">Posts (API Pública)</h1>

            {posts.map((p) => (
                <div key={p.id} className="p-4 border rounded-lg">
                    <h2 className="font-semibold">{p.title}</h2>
                    <p className="text-sm text-gray-600">{p.body}</p>
                </div>
            ))}
        </div>
    );
}