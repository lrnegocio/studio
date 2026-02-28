
"use client";
import { useState, useEffect } from 'react';
import { VideoContent, SubscriptionPlan, UserAccount } from '@/lib/types';
import { INITIAL_CONTENT, INITIAL_PLANS } from '@/lib/mock-data';

export function useContentStore() {
  const [content, setContent] = useState<VideoContent[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedContent = localStorage.getItem('leo_tv_content');
    const savedPlans = localStorage.getItem('leo_tv_plans');
    const savedUsers = localStorage.getItem('leo_tv_accounts');
    
    if (savedContent) setContent(JSON.parse(savedContent));
    else setContent(INITIAL_CONTENT);

    if (savedPlans) setPlans(JSON.parse(savedPlans));
    else setPlans(INITIAL_PLANS);

    if (savedUsers) setUserAccounts(JSON.parse(savedUsers));
    else setUserAccounts([]);

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

  const saveUserAccounts = (newUsers: UserAccount[]) => {
    setUserAccounts(newUsers);
    localStorage.setItem('leo_tv_accounts', JSON.stringify(newUsers));
  };

  return { 
    content, 
    plans, 
    userAccounts, 
    saveContent, 
    savePlans, 
    saveUserAccounts, 
    isLoaded 
  };
}
