import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./FeaturePage.css";

function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Resources Error:", error);
      setLoading(false);
      return;
    }

    console.log("Resources from Supabase:", data);

    setResources(data || []);
    setLoading(false);
  };

  const categories = [
    {
      key: "tools",
      title: "🛠️ Development Tools",
      description: "Useful tools for coding, testing and development.",
    },
    {
      key: "official_docs",
      title: "📖 Official Docs",
      description: "Official documentation and references for technologies.",
    },
    {
      key: "learning_platforms",
      title: "🎓 Learning Platforms",
      description: "Platforms for tutorials, courses and additional practice.",
    },
  ];

  return (
    <div className="feature-page">

      <div className="feature-header">
        <span>GROW</span>

        <h1>Resources</h1>

        <p>
          Find useful tools, official documentation and learning platforms
          to support your learning and development.
        </p>
      </div>

      <div className="feature-content">

        {loading ? (
          <p>Loading resources...</p>
        ) : (
          categories.map((category) => {

            const categoryResources = resources.filter(
              (resource) => resource.category === category.key
            );

            return (
              <div key={category.key} className="resource-section">

                <h2>{category.title}</h2>

                <p className="resource-description">
                  {category.description}
                </p>

                <div className="feature-list">

                  {categoryResources.map((resource) => (
                    <div
                      className="feature-row"
                      key={resource.id}
                    >

                      <div>
                        <strong>
                          {resource.icon} {resource.title}
                        </strong>

                        <span>
                          {resource.description}
                        </span>

                        {resource.technology && (
                          <small>
                            {resource.technology}
                          </small>
                        )}
                      </div>

                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Open →
                        </a>
                      )}

                    </div>
                  ))}

                </div>

              </div>
            );
          })
        )}

      </div>

    </div>
  );
}

export default Resources;