import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Container, Card, Button, Row, Col, Spinner } from "react-bootstrap";
import { getRecommendations } from "../api/recommendations";

export default function Recommendations() {
  const [products, setProducts] = useState([]);
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const loadingRef = useRef(null);
  const observerRef = useRef(null);

  const PAGE_SIZE = 12;
  const SCROLL_THRESHOLD = 200;

  // Memoized card style to prevent unnecessary re-renders
  const cardStyle = useMemo(() => ({
    background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03))",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    borderRadius: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.6)",
    color: "#fff",
    padding: "1.5rem",
    cursor: "pointer",
  }), []);

  // Fetch recommendations from backend API
  const fetchRecommendations = useCallback(async (pageNum, append = false) => {
    // Use a ref to track loading state to avoid dependency issues
    setLoading(true);
    
    try {
      console.log(`Fetching recommendations page ${pageNum}, append: ${append}`);
      const response = await getRecommendations(pageNum, PAGE_SIZE);
      const data = response.data;
      
      console.log("Received data:", { 
        productsCount: data.products?.length || 0, 
        hasMore: data.hasMore, 
        total: data.total,
        page: data.page 
      });
      
      const newProducts = data.products || [];
      
      if (append) {
        setProducts(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = newProducts.filter(p => !existingIds.has(p.id));
          console.log(`Adding ${uniqueNew.length} new products, total will be ${prev.length + uniqueNew.length}`);
          return [...prev, ...uniqueNew];
        });
      } else {
        // Set featured product from first page
        if (pageNum === 0 && newProducts.length > 0) {
          setFeaturedProduct(newProducts[0]);
          setProducts(newProducts.slice(1));
        } else {
          setProducts(newProducts);
        }
      }
      
      // Ensure hasMore is properly set
      // Use backend's hasMore value, but also verify with total count
      let hasMoreValue = false;
      if (typeof data.hasMore === 'boolean') {
        hasMoreValue = data.hasMore;
      } else if (data.hasMore === "true" || data.hasMore === true) {
        hasMoreValue = true;
      } else if (data.total !== undefined) {
        // Fallback: calculate based on total and page
        const itemsOnThisPage = newProducts.length;
        const expectedTotalForPage = (pageNum + 1) * PAGE_SIZE;
        hasMoreValue = data.total > expectedTotalForPage;
      }
      
      setHasMore(hasMoreValue);
      console.log("hasMore calculation:", {
        dataHasMore: data.hasMore,
        dataHasMoreType: typeof data.hasMore,
        total: data.total,
        currentPage: pageNum,
        pageSize: PAGE_SIZE,
        newProductsCount: newProducts.length,
        calculated: data.total > ((pageNum + 1) * PAGE_SIZE),
        final: hasMoreValue
      });
      setPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [PAGE_SIZE]);

  // Initial load
  useEffect(() => {
    fetchRecommendations(0, false);
  }, [fetchRecommendations]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    // Don't set up observer if no more products or currently loading
    if (!hasMore || loading) {
      return;
    }

    // Wait a bit for the loading ref to be rendered
    const timeoutId = setTimeout(() => {
      const currentLoadingRef = loadingRef.current;
      if (!currentLoadingRef) {
        console.log("Loading ref not available");
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry.isIntersecting && hasMore && !loading) {
            console.log("Intersection detected! Loading more products, current page:", page);
            fetchRecommendations(page + 1, true);
          }
        },
        {
          root: null,
          rootMargin: `${SCROLL_THRESHOLD}px`,
          threshold: 0.1,
        }
      );

      observer.observe(currentLoadingRef);
      observerRef.current = observer;
      console.log("Intersection Observer set up");
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [hasMore, loading, page, fetchRecommendations]);

  const handleCardClick = useCallback((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const ProductCard = React.memo(({ product, isFeatured = false }) => (
    <Card
      style={cardStyle}
      className="glass-card text-light shadow-lg h-100"
      onClick={() => handleCardClick(product.url)}
    >
      <div style={{ position: "relative", width: "100%", height: isFeatured ? "300px" : "200px", overflow: "hidden", borderRadius: "1rem", marginBottom: "1rem" }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.src = "https://placehold.co/400x300/1a1a1a/ffffff?text=Product+Image";
          }}
        />
        {isFeatured && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              background: "rgba(255, 215, 0, 0.9)",
              color: "#000",
              padding: "0.5rem 1rem",
              borderRadius: "1rem",
              fontWeight: "bold",
              fontSize: "0.9rem",
            }}
          >
            ⭐ Featured
          </div>
        )}
      </div>
      <Card.Body className="d-flex flex-column">
        <Card.Title className="fs-4 mb-2">{product.name}</Card.Title>
        <Card.Text className="mb-3" style={{ flex: 1 }}>
          {product.description}
        </Card.Text>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="fs-5 fw-bold">
            {product.price === 0 ? "Free" : `$${product.price.toFixed(2)}`}
          </div>
          <Button
            variant="outline-light"
            className="rounded-pill"
            onClick={(e) => {
              e.stopPropagation();
              handleCardClick(product.url);
            }}
          >
            View Here
          </Button>
        </div>
      </Card.Body>
    </Card>
  ));

  ProductCard.displayName = "ProductCard";

  return (
    <div className="container py-4" style={{ minHeight: "100vh" }}>
      <Container fluid style={{ minHeight: "100vh", color: "white", paddingTop: "2rem" }}>
        <h1 className="mb-5 text-center">Product Recommendations</h1>
        <p className="text-center mb-5">
          Based on your spending patterns and goals, we've curated these products to help you save money and manage your finances better.
        </p>

        {/* Initial Loading State */}
        {initialLoad && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="light" />
            <p className="mt-3 text-white-50">Loading personalized recommendations...</p>
          </div>
        )}

        {/* Featured Product */}
        {!initialLoad && featuredProduct && (
          <div className="mb-5">
            <h2 className="mb-4 text-center">🌟 Featured Recommendation</h2>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <ProductCard product={featuredProduct} isFeatured={true} />
              </Col>
            </Row>
          </div>
        )}

        {/* Other Recommendations */}
        {!initialLoad && products.length > 0 && (
          <div>
            <h2 className="mb-4 text-center">More Recommendations</h2>
            <Row className="g-4">
              {products.map((product) => (
                <Col key={product.id} md={6} lg={4}>
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* Loading Spinner for Infinite Scroll */}
        {!initialLoad && hasMore && (
          <div ref={loadingRef} className="text-center py-4">
            <Spinner animation="border" variant="light" size="sm" />
            <p className="mt-2 text-white-50 small">Loading more recommendations...</p>
          </div>
        )}

        {/* End of List */}
        {!initialLoad && !hasMore && products.length > 0 && (
          <div className="text-center py-4">
            <p className="text-white-50">You've reached the end of recommendations</p>
          </div>
        )}

        {/* No Recommendations */}
        {!initialLoad && products.length === 0 && !featuredProduct && (
          <div className="text-center mt-5">
            <p className="text-muted">No recommendations available. Start adding transactions and goals to get personalized recommendations!</p>
          </div>
        )}
      </Container>
    </div>
  );
}
