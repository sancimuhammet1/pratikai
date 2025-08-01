import { Card, CardContent } from "@/components/ui/card";

interface ProfessionCardProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  textColor: string;
  onClick: () => void;
}

export function ProfessionCard({
  title,
  description,
  icon,
  iconColor,
  bgColor,
  textColor,
  onClick
}: ProfessionCardProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow group border-gray-200 hover:border-gray-300"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center group-hover:${iconColor.replace('text-', 'bg-')} group-hover:text-white transition-colors`}>
            <i className={`${icon} text-xl ${iconColor} group-hover:text-white`}></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 ml-4">{title}</h3>
        </div>
        <p className="text-gray-600 mb-4">
          {description}
        </p>
        <div className={`flex items-center ${textColor} font-medium`}>
          <span>Başla</span>
          <i className="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"></i>
        </div>
      </CardContent>
    </Card>
  );
}
