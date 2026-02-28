
"use client";
import { useState, useEffect } from 'react';
import { VideoContent, SubscriptionPlan } from '@/lib/types';
import { INITIAL_CONTENT, INITIAL_PLANS } from '@/lib/mock-data';

export function useContentStore() {
  const [content, setContent] = useState<VideoContent[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem('leo_tv_content');
    const savedPlans = localStorage.getItem('leo_tv_plans');
    
    if (savedContent) setContent(JSON.parse(savedContent));
    else setContent(INITIAL_CONTENT);

    if (savedPlans) setPlans(JSON.parse(savedPlans));
    else setPlans(INITIAL_PLANS);

    setIsLoaded(true);
  }, []);

  const saveContent = (newContent: VideoContent[]) => {
    setContent(newContent);
    localStorage.setItem('leo_tv_content', JSON.stringify(newContent));
  };

  const savePlans = (newPlans: SubscriptionPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem('leo_tv_plans', JSON.stringify(newPlans));
  };

  return { content, plans, saveContent, savePlans, isLoaded };
}
