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

export const StepCard: React.FC<StepCardProps> = ({
  to,
  icon: Icon,
  iconBgColor,
  iconTextColor,
  title,
  description,
}) => (
  <Link to={to} className="block w-full h-full group touch-manipulation">
    <Card className="relative transition-all duration-300 border-2 cursor-pointer h-full animate-fade-in bg-[#eaeff0] [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:border-primary/20 [@media(hover:hover)]:hover:scale-105">
      <CardHeader className="p-6 flex flex-col justify-center h-full text-center">
        <div className="flex flex-col items-center">
          <div
            className={`w-12 h-12 ${iconBgColor} ${iconTextColor} rounded-full flex items-center justify-center mb-3 transition-transform duration-300 [@media(hover:hover)]:hover:scale-110`}
          >
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle className="text-lg font-semibold text-gray-900 mb-2 transition-colors uppercase [@media(hover:hover)]:group-hover:text-primary">
            {title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 leading-relaxed">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  </Link>
);
