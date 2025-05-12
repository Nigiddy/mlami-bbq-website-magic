
import { useState } from 'react';
import UserTable from './UserTable';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
}

interface PaginatedUserTableProps {
  users: Profile[];
  loading: boolean;
  onUpdateRole: (userId: string, newRole: string) => Promise<void>;
  onRefresh: () => void;
  pageSize?: number;
}

const PaginatedUserTable = ({ 
  users, 
  loading, 
  onUpdateRole, 
  onRefresh,
  pageSize = 10 
}: PaginatedUserTableProps) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Calculate the number of pages
  const totalPages = Math.ceil(users.length / pageSize);
  
  // Get the current page's users
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
  
  // Generate an array of page numbers to display in pagination
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first and last pages, and up to 3 pages around the current one
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - 2 && currentPage > 3) || 
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        // Add ellipsis indicators
        pages.push('ellipsis');
      }
    }
    
    // Remove duplicates and consecutive ellipses
    return pages.filter((page, index, array) => 
      page !== 'ellipsis' || 
      (page === 'ellipsis' && array[index - 1] !== 'ellipsis')
    );
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo(0, 0);
  };

  return (
    <div className="space-y-4">
      <UserTable 
        users={paginatedUsers}
        loading={loading}
        onUpdateRole={onUpdateRole}
        onRefresh={onRefresh}
      />
      
      {totalPages > 1 && !loading && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {getPageNumbers().map((page, idx) => 
              page === 'ellipsis' ? (
                <PaginationItem key={`ellipsis-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page as number)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            
            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default PaginatedUserTable;
