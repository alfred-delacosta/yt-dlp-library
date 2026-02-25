import React, { useState, useEffect } from 'react';

const Pagination = ({ currentItems, totalPages, currentPage, onPageChange, renderItem: RenderItem }) => {

  // Handle page navigation
  const goToPage = (page) => {
    const newPage = Math.min(Math.max(page, 1), totalPages);
    onPageChange(newPage);
    // Scroll to top of page when navigating to a new page
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  // Pagination controls component
  const PaginationControls = () => (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center">
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
        </li>
        
        {getPageNumbers().map((page) => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button
              className="page-link"
              onClick={() => goToPage(page)}
            >
              {page}
            </button>
          </li>
        ))}
        
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );

  return (
    <div className="pagination-container col-12">
      {totalPages > 1 && <PaginationControls />}
      
      <div className="items mb-3 row">
        {currentItems.map((item) => (
          <RenderItem key={item.id} item={item} />
        ))}
      </div>
      
      {totalPages > 1 && <PaginationControls className="mt-3" />}
    </div>
  );
};

export default Pagination;