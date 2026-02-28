
"use client";
import { useState, useEffect } from 'react';
import { VideoContent, SubscriptionPlan, AccessKey } from '@/lib/types';
import { INITIAL_CONTENT, INITIAL_PLANS } from '@/lib/mock-data';

export function useContentStore() {
  const [content, setContent] = useState<VideoContent[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem('leo_tv_content');
    const savedPlans = localStorage.getItem('leo_tv_plans');
    const savedKeys = localStorage.getItem('leo_tv_keys');
    
    if (savedContent) setContent(JSON.parse(savedContent));
    else setContent(INITIAL_CONTENT);

    if (savedPlans) setPlans(JSON.parse(savedPlans));
    else setPlans(INITIAL_PLANS);

    if (savedKeys) setKeys(JSON.parse(savedKeys));
    else setKeys([]);

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

  const saveKeys = (newKeys: AccessKey[]) => {
    setKeys(newKeys);
    localStorage.setItem('leo_tv_keys', JSON.stringify(newKeys));
  };

  return { 
    content, 
    plans, 
    keys, 
    saveContent, 
    savePlans, 
    saveKeys, 
    isLoaded 
  };
}
