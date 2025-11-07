import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Calendar, Leaf, AlertTriangle, CheckCircle, 
  Trash2, Edit2, Star, Search, Filter, Download, 
  MoreVertical, Tag, X, Check 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PlantScan {
  id: string;
  image_url: string;
  plant_type: string | null;
  health_status: string;
  disease_detected: string | null;
  confidence_score: number;
  diagnosis: string | null;
  created_at: string;
  custom_name?: string | null;
  is_favorite?: boolean;
  tags?: string[];
}

const KanPlantHistory = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<PlantScan[]>([]);
  const [filteredScans, setFilteredScans] = useState<PlantScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [scans, searchQuery, filterStatus, sortBy]);

  const loadHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("plant_scans")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      setScans(data || []);
    } catch (error: any) {
      console.error("Error loading history:", error);
      toast({
        title: "Error",
        description: "Failed to load scan history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...scans];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(scan => 
        scan.plant_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.disease_detected?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.custom_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      if (filterStatus === "favorites") {
        filtered = filtered.filter(scan => scan.is_favorite);
      } else {
        filtered = filtered.filter(scan => scan.health_status === filterStatus);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name":
          const nameA = a.custom_name || a.plant_type || "";
          const nameB = b.custom_name || b.plant_type || "";
          return nameA.localeCompare(nameB);
        default:
          return 0;
      }
    });

    setFilteredScans(filtered);
  };

  const handleDelete = async (scanId: string) => {
    try {
      // Store deleted scan for undo functionality
      const deletedScan = scans.find(s => s.id === scanId);
      
      const { error } = await supabase
        .from("plant_scans")
        .delete()
        .eq("id", scanId);

      if (error) throw error;

      setScans(prev => prev.filter(s => s.id !== scanId));
      
      toast({
        title: "Scan deleted",
        description: "The scan has been permanently deleted",
      });
    } catch (error: any) {
      console.error("Error deleting scan:", error);
      toast({
        title: "Error",
        description: "Failed to delete scan",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      const { error } = await supabase
        .from("plant_scans")
        .delete()
        .in("id", Array.from(selectedScans));

      if (error) throw error;

      setScans(prev => prev.filter(s => !selectedScans.has(s.id)));
      setSelectedScans(new Set());
      toast({
        title: "Success",
        description: `${selectedScans.size} scans deleted successfully`,
      });
    } catch (error: any) {
      console.error("Error deleting scans:", error);
      toast({
        title: "Error",
        description: "Failed to delete scans",
        variant: "destructive",
      });
    }
  };

  const handleRename = async (scanId: string, newName: string) => {
    if (!newName.trim()) {
      toast({
        title: "Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store old name for potential revert
      const scanToUpdate = scans.find(s => s.id === scanId);
      const oldName = scanToUpdate?.custom_name;
      
      // Optimistic update
      setScans(prev => prev.map(s => 
        s.id === scanId ? { ...s, custom_name: newName.trim() } : s
      ));
      setEditingId(null);

      const { error } = await supabase
        .from("plant_scans")
        .update({ custom_name: newName.trim() })
        .eq("id", scanId);

      if (error) throw error;

      toast({
        title: "Plant renamed",
        description: `Successfully renamed to "${newName.trim()}"`,
      });
    } catch (error: any) {
      console.error("Error renaming scan:", error);
      
      // Revert on error
      const scanToRevert = scans.find(s => s.id === scanId);
      if (scanToRevert) {
        setScans(prev => prev.map(s => 
          s.id === scanId ? { ...s, custom_name: scanToRevert.custom_name } : s
        ));
      }
      
      toast({
        title: "Error",
        description: "Failed to rename plant",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (scanId: string, currentFavorite: boolean) => {
    try {
      // Optimistic update - update UI immediately
      setScans(prev => prev.map(s => 
        s.id === scanId ? { ...s, is_favorite: !currentFavorite } : s
      ));

      // Then update database
      const { error } = await supabase
        .from("plant_scans")
        .update({ is_favorite: !currentFavorite })
        .eq("id", scanId);

      if (error) throw error;

      toast({
        title: currentFavorite ? "Removed from favorites" : "Added to favorites",
        description: currentFavorite ? "Plant removed from your favorites" : "Plant added to your favorites",
      });
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      
      // Revert optimistic update on error
      setScans(prev => prev.map(s => 
        s.id === scanId ? { ...s, is_favorite: currentFavorite } : s
      ));
      
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Plant Type", "Health Status", "Disease", "Confidence", "Diagnosis"];
    const rows = filteredScans.map(scan => [
      new Date(scan.created_at).toLocaleDateString(),
      scan.custom_name || scan.plant_type || "Unknown",
      scan.health_status,
      scan.disease_detected || "None",
      `${scan.confidence_score}%`,
      scan.diagnosis || ""
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plant-history-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "History exported as CSV",
    });
  };

  const toggleSelectScan = (scanId: string) => {
    setSelectedScans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(scanId)) {
        newSet.delete(scanId);
      } else {
        newSet.add(scanId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-8 shadow-soft">
        <div className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
      </div>
    );
  }

  if (scans.length === 0 && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 shadow-soft"
      >
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <Leaf className="w-16 h-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground">No Scans Yet</h3>
          <p className="text-muted-foreground max-w-md">
            Upload or capture your first plant image to start building your scan history
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-6 shadow-soft"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-foreground">Scan History</h3>
          
          <div className="flex gap-2">
            {selectedScans.size > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => {
                  setScanToDelete("bulk");
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedScans.size})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="diseased">Diseased</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Scan List */}
        <AnimatePresence mode="popLayout">
          {filteredScans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No scans match your filters</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredScans.map((scan, index) => (
                <motion.div
                  key={scan.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex gap-4 p-4 bg-background rounded-xl hover:shadow-soft transition-all group relative"
                >
                  {/* Selection Checkbox */}
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => toggleSelectScan(scan.id)}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedScans.has(scan.id) 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground hover:border-primary'
                    }`}>
                      {selectedScans.has(scan.id) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                  </div>

                  {/* Image */}
                  <img
                    src={scan.image_url}
                    alt="Plant scan"
                    className="w-24 h-24 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => navigate(`/scan/${scan.id}`)}
                  />
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        {editingId === scan.id ? (
                          <div className="flex gap-2 items-center">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename(scan.id, editName);
                                if (e.key === 'Escape') setEditingId(null);
                              }}
                              className="h-8"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleRename(scan.id, editName)}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <h4 className="font-semibold text-foreground cursor-pointer hover:text-primary" onClick={() => navigate(`/scan/${scan.id}`)}>
                              {scan.custom_name || scan.plant_type || "Unknown Plant"}
                            </h4>
                            {scan.custom_name && scan.plant_type && (
                              <p className="text-xs text-muted-foreground">Original: {scan.plant_type}</p>
                            )}
                          </>
                        )}
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {scan.health_status === "healthy" ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : scan.health_status === "diseased" ? (
                            <AlertTriangle className="w-4 h-4 text-destructive" />
                          ) : null}
                          <Badge
                            variant={
                              scan.health_status === "healthy"
                                ? "secondary"
                                : scan.health_status === "diseased"
                                ? "destructive"
                                : "outline"
                            }
                            className="capitalize"
                          >
                            {scan.health_status}
                          </Badge>
                          {scan.disease_detected && (
                            <Badge variant="outline">{scan.disease_detected}</Badge>
                          )}
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2 relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleFavorite(scan.id, scan.is_favorite || false)}
                          className={`transition-all ${scan.is_favorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"}`}
                        >
                          <Star className={`w-5 h-5 transition-all ${scan.is_favorite ? "fill-yellow-500" : ""}`} />
                        </Button>
                        
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(scan.created_at).toLocaleDateString()}
                        </div>

                        <DropdownMenu modal={false}>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="hover:bg-accent/50 transition-colors relative"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            align="end" 
                            side="bottom"
                            sideOffset={4}
                            alignOffset={0}
                            className="w-48"
                          >
                            <DropdownMenuItem 
                              onClick={() => {
                                setEditingId(scan.id);
                                setEditName(scan.custom_name || scan.plant_type || "");
                              }}
                            >
                              <Edit2 className="w-4 h-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/scan/${scan.id}`)}>
                              <Leaf className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10 hover:text-destructive focus:text-destructive"
                              onClick={() => {
                                setScanToDelete(scan.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    {scan.diagnosis && editingId !== scan.id && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {scan.diagnosis}
                      </p>
                    )}
                    
                    {scan.confidence_score && editingId !== scan.id && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Confidence: {scan.confidence_score}%
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {scanToDelete === "bulk" 
                ? `This will permanently delete ${selectedScans.size} selected scan(s). This action cannot be undone.`
                : "This will permanently delete this scan. This action cannot be undone."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (scanToDelete === "bulk") {
                  handleBulkDelete();
                } else if (scanToDelete) {
                  handleDelete(scanToDelete);
                }
                setDeleteDialogOpen(false);
                setScanToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default KanPlantHistory;
