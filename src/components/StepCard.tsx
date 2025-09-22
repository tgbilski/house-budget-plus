// src/components/StepCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from 'lucide-react';

interface StepCardProps {
  to: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  title: string;
  description: React.ReactNode;
}

export const StepCard: React.FC<StepCardProps> = ({ to, icon: Icon, iconBgColor, iconTextColor, title, description }) => (
  <Link to={to} className="block w-full h-full">
    <Card className="group relative hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 cursor-pointer hover:scale-105 h-full animate-fade-in bg-[#eaeff0]">
      <CardHeader className="p-6 flex flex-col justify-center h-full text-center">
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 ${iconBgColor} ${iconTextColor} rounded-full flex items-center justify-center mb-3 hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors uppercase">{title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  </Link>
);
