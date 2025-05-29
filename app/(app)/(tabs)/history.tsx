import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaWrapper } from '@/components/layout/SafeAreaWrapper';
import Colors from '@/constants/Colors';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchHistory, setSortBy, setFilterType } from '@/store/slices/historySlice';
import { useRouter } from 'expo-router';
import { Clock, ArrowDown, ArrowUp, Filter, Image, FileText, Mic, MessageSquare } from 'lucide-react-native';

// Sample history data for demonstration
const sampleHistory = [
  {
    id: '1',
    prompt: 'What is the area of a circle with radius 5cm?',
    type: 'text',
    createdAt: '2023-09-05T14:48:00.000Z',
    status: 'completed',
  },
  {
    id: '2',
    prompt: 'Solve this quadratic equation: 2x² + 5x - 3 = 0',
    type: 'text',
    createdAt: '2023-09-05T10:23:00.000Z',
    status: 'completed',
  },
  {
    id: '3',
    prompt: 'Can you explain this physics problem?',
    type: 'image',
    createdAt: '2023-09-04T16:30:00.000Z',
    status: 'completed',
  },
  {
    id: '4',
    prompt: 'Help me solve this chemistry problem from my textbook',
    type: 'pdf',
    createdAt: '2023-09-03T09:15:00.000Z',
    status: 'completed',
  },
  {
    id: '5',
    prompt: 'What is the derivative of f(x) = sin(x²)?',
    type: 'audio',
    createdAt: '2023-09-02T15:45:00.000Z',
    status: 'completed',
  },
];

export default function HistoryScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // In a real app, this would come from Redux
  // const { questions, isLoading, sortBy, filterType } = useSelector((state: RootState) => state.history);
  
  // For demo purposes, we'll use local state
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortByState] = useState<'newest' | 'oldest'>('newest');
  const [filterType, setFilterTypeState] = useState<'all' | 'text' | 'image' | 'pdf' | 'audio'>('all');
  const [questions, setQuestions] = useState(sampleHistory);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  useEffect(() => {
    loadHistory();
  }, [sortBy, filterType]);
  
  const loadHistory = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let filteredQuestions = [...sampleHistory];
      
      // Apply filter
      if (filterType !== 'all') {
        filteredQuestions = filteredQuestions.filter(q => q.type === filterType);
      }
      
      // Apply sort
      filteredQuestions.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
      });
      
      setQuestions(filteredQuestions);
      setIsLoading(false);
    }, 500);
  };
  
  const handleSortChange = (newSort: 'newest' | 'oldest') => {
    setSortByState(newSort);
    // In a real app: dispatch(setSortBy(newSort));
  };
  
  const handleFilterChange = (newFilter: 'all' | 'text' | 'image' | 'pdf' | 'audio') => {
    setFilterTypeState(newFilter);
    setIsFilterMenuOpen(false);
    // In a real app: dispatch(setFilterType(newFilter));
  };
  
  const handleQuestionPress = (questionId: string) => {
    // In a real app, this would navigate to a detail view
    console.log('View question:', questionId);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <MessageSquare size={16} color={Colors.primary[500]} />;
      case 'image':
        return <Image size={16} color={Colors.secondary[500]} />;
      case 'pdf':
        return <FileText size={16} color={Colors.error[500]} />;
      case 'audio':
        return <Mic size={16} color={Colors.accent[500]} />;
      default:
        return <MessageSquare size={16} color={Colors.primary[500]} />;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleQuestionPress(item.id)}
    >
      <View style={styles.historyHeader}>
        <View style={styles.typeContainer}>
          {getTypeIcon(item.type)}
          <Text style={styles.typeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
      </View>
      
      <Text style={styles.promptText} numberOfLines={2}>
        {item.prompt}
      </Text>
    </TouchableOpacity>
  );
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Clock size={48} color={Colors.neutral[400]} />
      <Text style={styles.emptyTitle}>No history yet</Text>
      <Text style={styles.emptyText}>
        Questions you ask will appear here so you can easily find them later
      </Text>
    </View>
  );

  return (
    <SafeAreaWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>
      
      <View style={styles.controlsContainer}>
        <View style={styles.sortContainer}>
          <Text style={styles.controlLabel}>Sort:</Text>
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'newest' && styles.activeButton]}
            onPress={() => handleSortChange('newest')}
          >
            <ArrowDown size={16} color={sortBy === 'newest' ? Colors.primary[600] : Colors.neutral[500]} />
            <Text style={[styles.sortText, sortBy === 'newest' && styles.activeText]}>
              Newest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.sortButton, sortBy === 'oldest' && styles.activeButton]}
            onPress={() => handleSortChange('oldest')}
          >
            <ArrowUp size={16} color={sortBy === 'oldest' ? Colors.primary[600] : Colors.neutral[500]} />
            <Text style={[styles.sortText, sortBy === 'oldest' && styles.activeText]}>
              Oldest
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity
          style={[styles.filterButton, filterType !== 'all' && styles.activeFilterButton]}
          onPress={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
        >
          <Filter size={16} color={filterType !== 'all' ? Colors.primary[600] : Colors.neutral[500]} />
          <Text style={[styles.filterText, filterType !== 'all' && styles.activeText]}>
            {filterType === 'all' ? 'All Types' : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>
      
      {isFilterMenuOpen && (
        <View style={styles.filterMenu}>
          <TouchableOpacity
            style={[styles.filterOption, filterType === 'all' && styles.activeFilterOption]}
            onPress={() => handleFilterChange('all')}
          >
            <Text style={[styles.filterOptionText, filterType === 'all' && styles.activeFilterOptionText]}>
              All Types
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, filterType === 'text' && styles.activeFilterOption]}
            onPress={() => handleFilterChange('text')}
          >
            <MessageSquare size={16} color={filterType === 'text' ? Colors.white : Colors.primary[500]} />
            <Text style={[styles.filterOptionText, filterType === 'text' && styles.activeFilterOptionText]}>
              Text
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, filterType === 'image' && styles.activeFilterOption]}
            onPress={() => handleFilterChange('image')}
          >
            <Image size={16} color={filterType === 'image' ? Colors.white : Colors.secondary[500]} />
            <Text style={[styles.filterOptionText, filterType === 'image' && styles.activeFilterOptionText]}>
              Image
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, filterType === 'pdf' && styles.activeFilterOption]}
            onPress={() => handleFilterChange('pdf')}
          >
            <FileText size={16} color={filterType === 'pdf' ? Colors.white : Colors.error[500]} />
            <Text style={[styles.filterOptionText, filterType === 'pdf' && styles.activeFilterOptionText]}>
              PDF
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterOption, filterType === 'audio' && styles.activeFilterOption]}
            onPress={() => handleFilterChange('audio')}
          >
            <Mic size={16} color={filterType === 'audio' ? Colors.white : Colors.accent[500]} />
            <Text style={[styles.filterOptionText, filterType === 'audio' && styles.activeFilterOptionText]}>
              Audio
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
        </View>
      ) : (
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      )}
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary[700],
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  controlLabel: {
    fontSize: 14,
    color: Colors.neutral[500],
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: Colors.neutral[100],
  },
  activeButton: {
    backgroundColor: Colors.primary[100],
  },
  sortText: {
    fontSize: 14,
    color: Colors.neutral[700],
    marginLeft: 4,
  },
  activeText: {
    color: Colors.primary[700],
    fontWeight: '500',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
  },
  activeFilterButton: {
    backgroundColor: Colors.primary[100],
  },
  filterText: {
    fontSize: 14,
    color: Colors.neutral[700],
    marginLeft: 4,
  },
  filterMenu: {
    position: 'absolute',
    top: 112,
    right: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  activeFilterOption: {
    backgroundColor: Colors.primary[500],
  },
  filterOptionText: {
    fontSize: 14,
    color: Colors.neutral[700],
    marginLeft: 8,
  },
  activeFilterOptionText: {
    color: Colors.white,
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.neutral[700],
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.neutral[500],
  },
  promptText: {
    fontSize: 16,
    color: Colors.neutral[800],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.neutral[700],
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: 8,
  },
});