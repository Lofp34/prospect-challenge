import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Phone, Users, Mail, Share2, MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';

const ProspectChallenge = () => {
  // État initial
  const initialState = {
    points: 0,
    level: 1,
    lastActionTime: null,
    weekStartDate: new Date().toLocaleDateString(),
  };

  const initialActions = {
    linkedinPosts: {
      info: { done: false, available: true },
      humor: { done: false, available: true },
      testimonial: { done: false, available: true },
      news: { done: false, available: true }
    },
    calls: { count: 0, weeklyTarget: 30 },
    networkingMeetings: { count: 0, weeklyTarget: 2 },
    recommendations: { count: 0, weeklyTarget: 5 },
    personalizedEmails: { count: 0, weeklyTarget: 5 },
    comments: { count: 0, weeklyTarget: 5 },
    messages: { count: 0, weeklyTarget: 5 }
  };

  // Définir les états
  const [state, setState] = useState(initialState);
  const [actions, setActions] = useState(initialActions);

  // Générer un ID utilisateur unique s'il n'existe pas
  const [userId] = useState(() => {
    const savedUserId = localStorage.getItem('prospectChallengeUserId');
    if (savedUserId) return savedUserId;
    const newUserId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('prospectChallengeUserId', newUserId);
    return newUserId;
  });

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/api/getData?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.state && data.actions) {
            // Convertir lastActionTime en objet Date si nécessaire
            const loadedState = {
              ...data.state,
              lastActionTime: data.state.lastActionTime ? new Date(data.state.lastActionTime) : null
            };
            setState(loadedState);
            setActions(data.actions);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    loadData();
  }, [userId]);

  // Sauvegarder les données via l'API
  useEffect(() => {
    const saveData = async () => {
      try {
        await fetch(`/api/saveData?userId=${userId}`, {
          method: 'POST',
          body: JSON.stringify({ state, actions }),
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des données:', error);
      }
    };

    // Ajouter un délai pour éviter trop d'appels API
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [state, actions, userId]);

  const pointsPerAction = {
    linkedinPost: 100,
    call: 50,
    networkingMeeting: 200,
    recommendation: 150,
    personalizedEmail: 75,
    comment: 30,
    message: 50
  };

  const getProgressPercentage = (count, target) => {
    return Math.min((count / target) * 100, 100);
  };

  const performLinkedInAction = (type) => {
    if (!actions.linkedinPosts[type].available) return;

    setActions(prev => ({
      ...prev,
      linkedinPosts: {
        ...prev.linkedinPosts,
        [type]: { done: true, available: false }
      }
    }));

    addPoints(pointsPerAction.linkedinPost);
  };

  const skipLinkedInAction = (type) => {
    setActions(prev => ({
      ...prev,
      linkedinPosts: {
        ...prev.linkedinPosts,
        [type]: { done: false, available: false }
      }
    }));
  };

  useEffect(() => {
    const allPostsProcessed = Object.values(actions.linkedinPosts)
      .every(post => !post.available);

    if (allPostsProcessed) {
      setActions(prev => ({
        ...prev,
        linkedinPosts: {
          info: { done: false, available: true },
          humor: { done: false, available: true },
          testimonial: { done: false, available: true },
          news: { done: false, available: true }
        }
      }));
    }
  }, [actions.linkedinPosts]);

  const addPoints = (basePoints) => {
    setState(prev => ({
      ...prev,
      points: prev.points + basePoints,
      lastActionTime: new Date()
    }));
  };

  const performAction = (actionType, points) => {
    setActions(prev => ({
      ...prev,
      [actionType]: {
        ...prev[actionType],
        count: prev[actionType].count + 1
      }
    }));
    addPoints(points);
  };

  // Composant pour la barre de progression
  const ProgressBar = ({ value, className = "" }) => (
    <div className={`h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-blue-500 transition-all duration-300 ease-out"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const ActionCard = ({ 
    title, 
    icon: Icon, 
    count, 
    target, 
    onAction, 
    actionText,
    className = "" 
  }) => (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-blue-500" />
            <span>{title}</span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {count}/{target}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProgressBar value={getProgressPercentage(count, target)} />
        <Button 
          onClick={onAction} 
          className="w-full group hover:translate-x-1 transition-transform duration-200"
        >
          {actionText}
          <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="relative min-h-screen bg-gray-50">
      <div className="sticky top-0 z-10 bg-gradient-to-b from-gray-50 to-transparent pb-4 pt-4">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Trophy className="h-8 w-8" />
                  <h2 className="text-3xl font-bold">{state.points}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white">
                    Niveau {state.level}
                  </Badge>
                  <Badge className="bg-white/20 text-white">
                    Semaine du {state.weekStartDate}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-500" />
              Posts LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            {Object.entries(actions.linkedinPosts).map(([type, status]) => (
              <div key={type} className="flex flex-col gap-2">
                <Button
                  onClick={() => performLinkedInAction(type)}
                  disabled={!status.available}
                  variant={status.done ? "success" : "default"}
                  className="w-full group hover:translate-y-[-2px] transition-transform duration-200"
                >
                  Post {type}
                  {status.available && (
                    <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  )}
                </Button>
                {status.available && (
                  <Button
                    onClick={() => skipLinkedInAction(type)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-gray-100"
                  >
                    Sauter
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            title="Appels"
            icon={Phone}
            count={actions.calls.count}
            target={actions.calls.weeklyTarget}
            onAction={() => performAction('calls', pointsPerAction.call)}
            actionText="Effectuer un appel"
          />

          <ActionCard
            title="Rencontres Réseau"
            icon={Users}
            count={actions.networkingMeetings.count}
            target={actions.networkingMeetings.weeklyTarget}
            onAction={() => performAction('networkingMeetings', pointsPerAction.networkingMeeting)}
            actionText="Ajouter une rencontre"
          />

          <ActionCard
            title="Demandes de recommandation"
            icon={ThumbsUp}
            count={actions.recommendations.count}
            target={actions.recommendations.weeklyTarget}
            onAction={() => performAction('recommendations', pointsPerAction.recommendation)}
            actionText="Demander une recommandation"
          />

          <ActionCard
            title="Emails de prospection personnalisés"
            icon={Mail}
            count={actions.personalizedEmails.count}
            target={actions.personalizedEmails.weeklyTarget}
            onAction={() => performAction('personalizedEmails', pointsPerAction.personalizedEmail)}
            actionText="Envoyer un email"
          />

          <ActionCard
            title="Commentaires prospects"
            icon={MessageSquare}
            count={actions.comments.count}
            target={actions.comments.weeklyTarget}
            onAction={() => performAction('comments', pointsPerAction.comment)}
            actionText="Ajouter un commentaire"
          />

          <ActionCard
            title="Messages prospects"
            icon={Mail}
            count={actions.messages.count}
            target={actions.messages.weeklyTarget}
            onAction={() => performAction('messages', pointsPerAction.message)}
            actionText="Envoyer un message"
          />
        </div>
      </div>

      {state.lastActionTime && (
        <div className="fixed bottom-4 right-4 transform transition-transform duration-300 hover:translate-y-[-4px]">
          <Badge variant="success" className="shadow-lg">
            Dernière action : {new Date(state.lastActionTime).toLocaleTimeString()}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default ProspectChallenge;
