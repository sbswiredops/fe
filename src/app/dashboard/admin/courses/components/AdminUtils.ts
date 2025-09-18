export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'inactive':
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getLevelColor = (level: string) => {
  const v = (level || '').toString().toLowerCase();
  switch (v) {
    case 'beginner':
      return 'bg-green-100 text-green-800';
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800';
    case 'advanced':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
