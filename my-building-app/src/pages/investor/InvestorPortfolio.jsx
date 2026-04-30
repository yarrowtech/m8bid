import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BriefcaseBusiness,
  IndianRupee,
  TrendingUp,
  MoreVertical,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import InvestorSidebar from './InvestorSidebar';
import { getMyInvestments } from '../../api/investmentapi';

const formatINR = (amount) => {
  const value = Number(amount || 0);
  return 'Rs ' + value.toLocaleString('en-IN');
};

const getExpectedReturn = (investment, campaign) => {
  const profitPercent = Number(campaign?.profitPercentage || 0);
  const amount = Number(investment?.amount || 0);
  return Math.round(amount * profitPercent / 100);
};

const getCurrentValue = (investment, campaign) => {
  const amount = Number(investment?.amount || 0);
  const expectedReturn = getExpectedReturn(investment, campaign);
  return amount + expectedReturn;
};

const getReturnRate = (investment, campaign) => {
  const profitPercent = Number(campaign?.profitPercentage || 0);
  return profitPercent > 0 ? `+${profitPercent}%` : 'N/A';
};

const getInvestmentStatus = (investment) => {
  const paymentStatus = String(investment?.paymentStatus || '').toLowerCase();
  const status = String(investment?.status || '').toLowerCase();
  const campaignStatus = String(investment?.campaign?.status || '').toLowerCase();

  if (paymentStatus === 'completed' || status === 'confirmed') return 'Active';
  if (status === 'failed' || paymentStatus === 'failed') return 'Failed';
  if (campaignStatus === 'completed') return 'Completed';
  return 'Pending';
};

function PortfolioStat({ title, value, sub, icon: Icon, tone = 'sky' }) {
  const tones = {
    sky: 'bg-[#f1edff] text-[#6f5cf2]',
    emerald: 'bg-emerald-100 text-emerald-700',
    indigo: 'bg-[#f3efff] text-[#7b68f4]',
    red: 'bg-red-100 text-red-700',
  };

  return (
    <div className='rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm'>
      <div className='flex items-center justify-between gap-3'>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-wide text-slate-400'>
            {title}
          </p>
          <h3 className='mt-2 text-2xl font-bold text-slate-900'>{value}</h3>
          <p className='mt-1 text-sm text-slate-500'>{sub}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tones[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function PortfolioRow({
  id,
  title,
  category,
  invested,
  currentValue,
  returnRate,
  status,
  campaignId,
  onView,
}) {
  return (
    <div className='grid grid-cols-6 items-center gap-3 border-t border-slate-100 px-4 py-4 text-sm'>
      <div className='font-semibold text-slate-900'>{title}</div>
      <div className='text-slate-600'>{category}</div>
      <div className='text-slate-900'>{invested}</div>
      <div className='text-slate-900'>{currentValue}</div>
      <div className='font-semibold text-emerald-600'>{returnRate}</div>
      <div className='flex items-center justify-between'>
        <span className='rounded-full bg-[#f1edff] px-3 py-1 text-[11px] font-semibold text-[#6f5cf2]'>
          {status}
        </span>
        <button
          onClick={() => onView && onView(campaignId)}
          className='rounded-full p-1 text-slate-400 hover:bg-slate-50'
        >
          <MoreVertical size={15} />
        </button>
      </div>
    </div>
  );
}

export default function InvestorPortfolio() {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await getMyInvestments();
        const investmentList = Array.isArray(response?.investments)
          ? response.investments
          : [];
        setInvestments(investmentList);
      } catch (err) {
        setError(err?.message || 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const portfolioStats = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + Number(inv?.amount || 0), 0);
    const totalCurrentValue = investments.reduce((sum, inv) => {
      const campaign = inv?.campaign || inv?.campaignId;
      return sum + getCurrentValue(inv, campaign);
    }, 0);
    const netReturns = totalCurrentValue - totalInvested;

    return {
      totalInvested,
      totalCurrentValue,
      netReturns,
    };
  }, [investments]);

  const portfolioItems = useMemo(() => {
    return investments.map((investment) => {
      const campaign = investment?.campaign || investment?.campaignId;
      return {
        id: investment._id,
        title: campaign?.projectTitle || 'Unknown Campaign',
        category: campaign?.projectCategory || 'General',
        invested: formatINR(investment.amount),
        currentValue: formatINR(getCurrentValue(investment, campaign)),
        returnRate: getReturnRate(investment, campaign),
        status: getInvestmentStatus(investment),
        campaignId: campaign?._id,
      };
    });
  }, [investments]);

  const handleViewInvestment = (campaignId) => {
    if (campaignId) {
      navigate(`/investment-detail/${campaignId}`);
    }
  };

  return (
    <div
      className='h-screen w-full bg-[#e3e8f0] text-slate-900'
      style={{
        fontFamily:
          'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif',
      }}
    >
      <div className='flex h-screen w-full overflow-hidden bg-[#f7f7fb]'>
        <InvestorSidebar active='portfolio' />

        <main
          className='scrollbar-hide flex-1 overflow-y-auto px-6 py-6'
          style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
        >
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-slate-900'>Portfolio</h1>
              <p className='mt-1 text-sm text-slate-500'>
                Track all your active and past investments.
              </p>
            </div>

            <button
              onClick={() => navigate('/browse-investors')}
              className='rounded-2xl bg-[#6f5cf2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#5f4ae6]'
            >
              Explore More Opportunities
            </button>
          </div>

          {loading ? (
            <div className='mt-6 flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-[#6f5cf2]' />
              <span className='ml-3 text-slate-600'>Loading portfolio...</span>
            </div>
          ) : error ? (
            <div className='mt-6 rounded-2xl border border-red-200 bg-red-50 p-6'>
              <div className='flex items-center gap-3'>
                <AlertCircle className='h-6 w-6 text-red-600' />
                <div>
                  <h3 className='font-semibold text-red-900'>Error Loading Portfolio</h3>
                  <p className='mt-1 text-sm text-red-700'>{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className='mt-6 grid gap-4 md:grid-cols-3'>
                <PortfolioStat
                  title='Total Invested'
                  value={formatINR(portfolioStats.totalInvested)}
                  sub='Total deployed capital'
                  icon={IndianRupee}
                  tone='sky'
                />
                <PortfolioStat
                  title='Current Value'
                  value={formatINR(portfolioStats.totalCurrentValue)}
                  sub='Estimated portfolio value'
                  icon={BriefcaseBusiness}
                  tone='indigo'
                />
                <PortfolioStat
                  title='Net Returns'
                  value={portfolioStats.netReturns >= 0 ? `+${formatINR(portfolioStats.netReturns)}` : formatINR(portfolioStats.netReturns)}
                  sub='Estimated gains'
                  icon={TrendingUp}
                  tone={portfolioStats.netReturns >= 0 ? 'emerald' : 'red'}
                />
              </div>

              <div className='mt-6 rounded-[28px] border border-slate-100 bg-white shadow-sm'>
                <div className='grid grid-cols-6 gap-3 px-4 py-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400'>
                  <div>Investment</div>
                  <div>Category</div>
                  <div>Invested</div>
                  <div>Current Value</div>
                  <div>Return</div>
                  <div>Status</div>
                </div>

                {portfolioItems.length === 0 ? (
                  <div className='px-4 py-8 text-center text-slate-500'>
                    <BriefcaseBusiness className='mx-auto h-12 w-12 text-slate-300' />
                    <p className='mt-3 text-sm'>No investments found</p>
                    <p className='text-xs'>Start investing to build your portfolio</p>
                  </div>
                ) : (
                  portfolioItems.map((item) => (
                    <PortfolioRow
                      key={item.id}
                      {...item}
                      onView={handleViewInvestment}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
